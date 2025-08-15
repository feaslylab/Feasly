import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import AdmZip from "npm:adm-zip@0.5.10";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EMDF parsing logic (inline to avoid import issues)
async function emdfToDto(filePath: string) {
  const { parseStringPromise: xml } = await import("npm:xml2js@0.6.2");
  
  try {
    // Read the zip file
    const zipData = await Deno.readFile(filePath);
    const zip = new AdmZip(zipData);
    const entries = Object.fromEntries(
      zip.getEntries().map(e => [e.entryName, e.getData().toString("utf8")])
    );

    const load = async (name: string) => {
      if (!entries[name]) {
        console.warn(`Missing file in EMDF: ${name}`);
        return {};
      }
      return xml(entries[name], { explicitArray: false });
    };

    // 1. construction (assumes one line, lump-sum cost)
    const proj = await load("DF_Project.xml");
    const cost = Number(proj.Project?.LandCost ?? 0);
    const construction = cost
      ? [{ 
          baseCost: cost, 
          startPeriod: 0, 
          endPeriod: 3,
          escalationRate: 0, 
          retentionPercent: 0, 
          retentionReleaseLag: 0 
        }]
      : [];

    // 2. sales (assumes one block in Option0/DF.xml)
    const opt = await load("Option0/DF.xml");
    const saleXml = opt.Option?.Sales?.Sale;
    const sales = saleXml
      ? [{
          units: Number(saleXml.Units),
          pricePerUnit: Number(saleXml.PricePerUnit),
          startPeriod: Number(saleXml.StartMonth),
          endPeriod: Number(saleXml.EndMonth),
          escalation: Number(saleXml.Escalation)
        }]
      : [];

    // 2b. rentals (if present in Option0/DF.xml)
    const rentalXml = opt.Option?.Rentals?.Rental;
    const rentals = rentalXml
      ? [{
          rooms: Number(rentalXml.Rooms),
          adr: Number(rentalXml.ADR),
          occupancyRate: Number(rentalXml.OccupancyRate),
          startPeriod: Number(rentalXml.StartMonth),
          endPeriod: Number(rentalXml.EndMonth),
          annualEscalation: Number(rentalXml.AnnualEscalation)
        }]
      : [];

    // 3. loan (simplified – one senior facility)
    const fin = await load("DF_Common.xml");
    const loanXml = fin.Common?.Finance?.Facility;
    const loan = loanXml ? {
        limit: Number(loanXml.Limit),
        ltcPercent: Number(loanXml.LTCPerc),
        annualRate: Number(loanXml.EffRate),
        startPeriod: 0,
        maturityPeriod: 60,
        interestOnly: true
      } : undefined;

    return { construction, sales, rentals, loan };
  } catch (error) {
    console.error('Error parsing EMDF:', error);
    return { construction: [], sales: [], rentals: [], loan: undefined };
  }
}

// Simple KPI calculation
function computeKPIs(cashflows: number[]) {
  const totalRevenue = cashflows.filter(c => c > 0).reduce((sum, c) => sum + c, 0);
  const totalCosts = cashflows.filter(c => c < 0).reduce((sum, c) => sum + Math.abs(c), 0);
  const netProfit = totalRevenue - totalCosts;
  const irr = netProfit / totalCosts; // Simplified IRR calculation
  
  return {
    total_revenue: totalRevenue,
    total_cost: totalCosts,
    profit: netProfit,
    irr: irr
  };
}

// Engine runner (inline)
function runEngine(dto: any) {
  const horizon = 60;
  const cash = Array(horizon).fill(0);

  // Simple cashflow calculation - this is a simplified version
  // In real implementation, this would use the full feasly-engine
  for (const c of dto.construction) {
    // Spread construction cost over period
    const periodLength = c.endPeriod - c.startPeriod + 1;
    const costPerPeriod = c.baseCost / periodLength;
    for (let i = c.startPeriod; i <= c.endPeriod && i < horizon; i++) {
      cash[i] -= costPerPeriod;
    }
  }

  for (const s of dto.sales) {
    // Add sales revenue
    const periodLength = s.endPeriod - s.startPeriod + 1;
    const revenuePerPeriod = (s.units * s.pricePerUnit) / periodLength;
    for (let i = s.startPeriod; i <= s.endPeriod && i < horizon; i++) {
      cash[i] += revenuePerPeriod;
    }
  }

  for (const r of dto.rentals) {
    // Add rental revenue
    const monthlyRevenue = r.rooms * r.adr * 30.4167 * r.occupancyRate;
    for (let i = r.startPeriod; i <= r.endPeriod && i < horizon; i++) {
      cash[i] += monthlyRevenue;
    }
  }

  const kpi = computeKPIs(cash);
  return { cash, kpi };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user from JWT
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with user authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { name, bucket, metadata } = await req.json();
    const userId = user.id; // Use authenticated user's ID
    
    if (bucket !== "emdf_imports") {
      return new Response("Wrong bucket", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`Processing EMDF file: ${name}`);

    // 1. Download file from storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(name);
    
    if (error) {
      console.error("Storage download error:", error);
      throw error;
    }

    // 2. Parse EMDF file
    const uint8 = new Uint8Array(await data.arrayBuffer());
    const tmp = crypto.randomUUID() + ".zip";
    await Deno.writeFile(tmp, uint8);
    
    const dto = await emdfToDto(tmp);
    const out = runEngine(dto);
    
    await Deno.remove(tmp);

    const projectId = crypto.randomUUID();
    const scenarioId = crypto.randomUUID();

    console.log(`Creating project ${projectId} for user ${userId}`);

    // 3. Insert project
    const { error: projectError } = await supabase
      .from("projects")
      .insert({ 
        id: projectId, 
        name: metadata?.proj_name ?? name.replace(/\.(emdf|zip)$/i, ''), 
        user_id: userId 
      });

    if (projectError) {
      console.error("Project insert error:", projectError);
      throw projectError;
    }

    // 4. Insert scenario
    const { error: scenarioError } = await supabase
      .from("scenarios")
      .insert({ 
        id: scenarioId, 
        project_id: projectId, 
        name: "Imported", 
        user_id: userId 
      });

    if (scenarioError) {
      console.error("Scenario insert error:", scenarioError);
      throw scenarioError;
    }

    // 5. Insert construction items
    if (dto.construction.length > 0) {
      const constructionItems = dto.construction.map(c => ({
        base_cost: c.baseCost,
        start_period: c.startPeriod,
        end_period: c.endPeriod,
        escalation_rate: c.escalationRate,
        retention_percent: c.retentionPercent,
        retention_release_lag: c.retentionReleaseLag,
        project_id: projectId,
        scenario_id: scenarioId,
        user_id: userId
      }));

      const { error: constructionError } = await supabase
        .from("construction_item")
        .insert(constructionItems);

      if (constructionError) {
        console.error("Construction insert error:", constructionError);
        throw constructionError;
      }
    }

    // 6. Insert sales
    if (dto.sales.length > 0) {
      const salesItems = dto.sales.map(s => ({
        units: s.units,
        price_per_unit: s.pricePerUnit,
        start_period: s.startPeriod,
        end_period: s.endPeriod,
        escalation: s.escalation,
        project_id: projectId,
        scenario_id: scenarioId,
        user_id: userId
      }));

      const { error: salesError } = await supabase
        .from("revenue_sale")
        .insert(salesItems);

      if (salesError) {
        console.error("Sales insert error:", salesError);
        throw salesError;
      }
    }

    // 7. Insert rentals
    if (dto.rentals.length > 0) {
      const rentalItems = dto.rentals.map(r => ({
        rooms: r.rooms,
        adr: r.adr,
        occupancy_rate: r.occupancyRate,
        start_period: r.startPeriod,
        end_period: r.endPeriod,
        annual_escalation: r.annualEscalation,
        project_id: projectId,
        scenario_id: scenarioId,
        user_id: userId
      }));

      const { error: rentalError } = await supabase
        .from("revenue_rental")
        .insert(rentalItems);

      if (rentalError) {
        console.error("Rental insert error:", rentalError);
        throw rentalError;
      }
    }

    // 8. Insert KPI snapshot
    const { error: kpiError } = await supabase
      .from("kpi_snapshot")
      .insert({
        project_id: projectId,
        user_id: userId,
        npv: out.kpi.total_revenue - out.kpi.total_cost,
        irr: out.kpi.irr,
        profit: out.kpi.profit
      });

    if (kpiError) {
      console.error("KPI insert error:", kpiError);
      throw kpiError;
    }

    console.log(`Successfully imported EMDF: ${name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        projectId, 
        scenarioId,
        message: "EMDF imported successfully" 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Import EMDF error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});