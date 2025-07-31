import { supabase } from '@/integrations/supabase/client'
import JSZip from 'jszip'
import { csvFormat } from 'd3-dsv'

export async function exportModel(projectId: string, scenarioId: string) {
  try {
    // Fetch all required data with RLS
    const [cashflowResult, kpiResult, constructionResult, saleResult, rentalResult] = await Promise.all([
      // Cashflow data
      supabase
        .from('feasly_cashflows')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario', scenarioId)
        .order('month'),

      // KPI data
      supabase
        .from('kpi_snapshot')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_id', scenarioId)
        .order('created_at', { ascending: false })
        .limit(1),

      // Construction items
      supabase
        .from('construction_item')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_id', scenarioId),

      // Sale items
      supabase
        .from('revenue_sale')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_id', scenarioId),

      // Rental items
      supabase
        .from('revenue_rental')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_id', scenarioId)
    ])

    // Check for errors
    if (cashflowResult.error) throw cashflowResult.error
    if (kpiResult.error) throw kpiResult.error
    if (constructionResult.error) throw constructionResult.error
    if (saleResult.error) throw saleResult.error
    if (rentalResult.error) throw rentalResult.error

    // Create ZIP file
    const zip = new JSZip()

    // Add cash.csv
    if (cashflowResult.data && cashflowResult.data.length > 0) {
      const cashCsv = csvFormat(cashflowResult.data)
      zip.file('cash.csv', cashCsv)
    }

    // Add kpi.json
    if (kpiResult.data && kpiResult.data.length > 0) {
      zip.file('kpi.json', JSON.stringify(kpiResult.data[0], null, 2))
    }

    // Add construction.csv
    if (constructionResult.data && constructionResult.data.length > 0) {
      const constructionCsv = csvFormat(constructionResult.data)
      zip.file('construction.csv', constructionCsv)
    }

    // Add sale.csv
    if (saleResult.data && saleResult.data.length > 0) {
      const saleCsv = csvFormat(saleResult.data)
      zip.file('sale.csv', saleCsv)
    }

    // Add rental.csv
    if (rentalResult.data && rentalResult.data.length > 0) {
      const rentalCsv = csvFormat(rentalResult.data)
      zip.file('rental.csv', rentalCsv)
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    return zipBlob

  } catch (error) {
    console.error('Error exporting model:', error)
    throw error
  }
}