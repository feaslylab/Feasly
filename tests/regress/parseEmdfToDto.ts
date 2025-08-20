import AdmZip from "adm-zip";
import { parseStringPromise as xml } from "xml2js";
import fs from "fs";
import path from "path";
import {
  ConstructionItem,
  SaleLine,
  RentalLine,
  LoanFacility
} from "@feasly/feasly-engine";

/** VERY minimal parser – enough to support the fixture.
    It extracts:
      • construction costs  (DF_Project/Construction/*)
      • unit-sale revenues  (Option0/Revenue/*)
      • loan params         (DF_Common/Finance/*)
*/
export async function emdfToDto(
  emdfPath: string
): Promise<{
  construction: ConstructionItem[];
  sales:        SaleLine[];
  rentals:      RentalLine[];
  loan?:        LoanFacility;
}> {
  try {
    // For testing, if emdfPath points to a directory, read XML files directly
    if (fs.statSync(emdfPath).isDirectory()) {
      return await parseFromDirectory(emdfPath);
    }
    
    // Otherwise, treat as ZIP file
    const zip = new AdmZip(emdfPath);
    const entries = Object.fromEntries(
      zip.getEntries().map(e => [e.entryName, e.getData().toString("utf8")])
    );

    // ---- minimal XML helpers ------------------------------------------
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
    const construction: ConstructionItem[] = cost
      ? [{ baseCost: cost, startPeriod: 0, endPeriod: 3,
           escalationRate: 0, retentionPercent: 0, retentionReleaseLag: 0 }]
      : [];

  // 2. sales (assumes one block in Option0/DF.xml)
  const opt = await load("Option0/DF.xml");
  const saleXml = opt.Option?.Sales?.Sale;
  const sales: SaleLine[] = saleXml
    ? [{
        units:         Number(saleXml.Units),
        pricePerUnit:  Number(saleXml.PricePerUnit),
        startPeriod:   Number(saleXml.StartMonth),
        endPeriod:     Number(saleXml.EndMonth),
        escalation:    Number(saleXml.Escalation)
      }]
    : [];

  // 2b. rentals (if present in Option0/DF.xml)
  const rentalXml = opt.Option?.Rentals?.Rental;
  const rentals: RentalLine[] = rentalXml
    ? [{
        rooms:           Number(rentalXml.Rooms),
        adr:             Number(rentalXml.ADR),
        occupancyRate:   Number(rentalXml.OccupancyRate),
        startPeriod:     Number(rentalXml.StartMonth),
        endPeriod:       Number(rentalXml.EndMonth),
        annualEscalation: Number(rentalXml.AnnualEscalation)
      }]
    : [];

    // 3. loan (simplified – one senior facility)
    const fin = await load("DF_Common.xml");
    const loanXml = fin.Common?.Finance?.Facility;
    const loan: LoanFacility | undefined = loanXml ? {
        limit:          Number(loanXml.Limit),
        ltcPercent:     Number(loanXml.LTCPerc),
        annualRate:     Number(loanXml.EffRate),
        startPeriod:    0,
        maturityPeriod: 60,
        interestOnly:   true
      } : undefined;

    return { construction, sales, rentals, loan };
  } catch (error) {
    console.error('Error parsing EMDF:', error);
    return { construction: [], sales: [], rentals: [], loan: undefined };
  }
}

// Helper function to parse from directory structure (for testing)
async function parseFromDirectory(dirPath: string): Promise<{
  construction: ConstructionItem[];
  sales: SaleLine[];
  rentals: RentalLine[];
  loan?: LoanFacility;
}> {
  const loadFile = async (filePath: string) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`Missing file: ${filePath}`);
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return xml(content, { explicitArray: false });
  };

  // 1. construction (assumes one line, lump-sum cost)
  const proj = await loadFile(path.join(dirPath, "DF_Project.xml"));
  const cost = Number(proj.Project?.LandCost ?? 0);
  const construction: ConstructionItem[] = cost
    ? [{ baseCost: cost, startPeriod: 0, endPeriod: 3,
         escalationRate: 0, retentionPercent: 0, retentionReleaseLag: 0 }]
    : [];

  // 2. sales (assumes one block in Option0/DF.xml)
  const opt = await loadFile(path.join(dirPath, "Option0", "DF.xml"));
  const saleXml = opt.Option?.Sales?.Sale;
  const sales: SaleLine[] = saleXml
    ? [{
        units:         Number(saleXml.Units),
        pricePerUnit:  Number(saleXml.PricePerUnit),
        startPeriod:   Number(saleXml.StartMonth),
        endPeriod:     Number(saleXml.EndMonth),
        escalation:    Number(saleXml.Escalation)
      }]
    : [];

  // 2b. rentals (if present in Option0/DF.xml)
  const rentalXml = opt.Option?.Rentals?.Rental;
  const rentals: RentalLine[] = rentalXml
    ? [{
        rooms:           Number(rentalXml.Rooms),
        adr:             Number(rentalXml.ADR),
        occupancyRate:   Number(rentalXml.OccupancyRate),
        startPeriod:     Number(rentalXml.StartMonth),
        endPeriod:       Number(rentalXml.EndMonth),
        annualEscalation: Number(rentalXml.AnnualEscalation)
      }]
    : [];

  // 3. loan (simplified – one senior facility)
  const fin = await loadFile(path.join(dirPath, "DF_Common.xml"));
  const loanXml = fin.Common?.Finance?.Facility;
  const loan: LoanFacility | undefined = loanXml ? {
      limit:          Number(loanXml.Limit),
      ltcPercent:     Number(loanXml.LTCPerc),
      annualRate:     Number(loanXml.EffRate),
      startPeriod:    0,
      maturityPeriod: 60,
      interestOnly:   true
    } : undefined;

  return { construction, sales, rentals, loan };
}