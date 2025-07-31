import { FeaslyModelFormData } from '@/components/FeaslyModel/types';

export interface ModelDraft {
  id: string;
  data: FeaslyModelFormData;
  etag: string;
  lastModified: string;
}

export interface ConflictError extends Error {
  name: 'ConflictError';
  serverData: any;
  localData: any;
  etag: string;
}

/**
 * API adapter for Feasly Model operations
 * Handles drafts, commits, and conflict resolution
 */
export class FeaslyModelAPI {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Save draft to server with optional etag for conflict detection
   */
  async patchDraft(modelId: string, data: FeaslyModelFormData, etag?: string): Promise<{ etag: string }> {
    const response = await fetch(`${this.baseUrl}/models/${modelId}/draft`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(etag && { 'If-Match': etag })
      },
      body: JSON.stringify(this.transformToEngineFormat(data))
    });

    if (response.status === 409) {
      const conflictData = await response.json();
      const error = new Error('Conflict detected') as ConflictError;
      error.name = 'ConflictError';
      error.serverData = conflictData.serverData;
      error.localData = data;
      error.etag = conflictData.etag;
      throw error;
    }

    if (!response.ok) {
      throw new Error(`Draft save failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { etag: result.etag };
  }

  /**
   * Commit final model version with conflict detection
   */
  async commit(modelId: string, data: FeaslyModelFormData, etag?: string): Promise<{ etag: string; version: number }> {
    const response = await fetch(`${this.baseUrl}/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(etag && { 'If-Match': etag })
      },
      body: JSON.stringify(this.transformToEngineFormat(data))
    });

    if (response.status === 409) {
      const conflictData = await response.json();
      const error = new Error('Conflict detected') as ConflictError;
      error.name = 'ConflictError';
      error.serverData = conflictData.serverData;
      error.localData = data;
      error.etag = conflictData.etag;
      throw error;
    }

    if (!response.ok) {
      throw new Error(`Commit failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { etag: result.etag, version: result.version };
  }

  /**
   * Get latest model data with etag
   */
  async getModel(modelId: string): Promise<{ data: FeaslyModelFormData; etag: string }> {
    const response = await fetch(`${this.baseUrl}/models/${modelId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      data: this.transformFromEngineFormat(result.data),
      etag: result.etag
    };
  }

  /**
   * Get draft if available
   */
  async getDraft(modelId: string): Promise<{ data: FeaslyModelFormData; etag: string } | null> {
    const response = await fetch(`${this.baseUrl}/models/${modelId}/draft`);

    if (response.status === 404) {
      return null; // No draft exists
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch draft: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      data: this.transformFromEngineFormat(result.data),
      etag: result.etag
    };
  }

  /**
   * Transform form data to engine format for API
   */
  private transformToEngineFormat(data: FeaslyModelFormData): any {
    return {
      // Project metadata
      project_name: data.project_name,
      description: data.description,
      location: data.location,
      currency_code: data.currency_code,
      
      // Timeline
      start_date: data.start_date,
      completion_date: data.completion_date,
      duration_months: data.duration_months,
      
      // Site metrics
      site_area_sqm: data.site_area_sqm,
      total_gfa_sqm: data.total_gfa_sqm,
      
      // Financial inputs
      land_cost: data.land_cost,
      loan_amount: data.loan_amount,
      interest_rate: data.interest_rate,
      loan_term_years: data.loan_term_years,
      
      // Line items (keep arrays as-is)
      construction_items: data.construction_items || [],
      soft_cost_items: data.soft_cost_items || [],
      marketing_cost_items: data.marketing_cost_items || [],
      contingency_items: data.contingency_items || [],
      sale_lines: data.sale_lines || [],
      rental_lines: data.rental_lines || [],
      
      // Settings
      phasing_enabled: data.phasing_enabled,
      zakat_applicable: data.zakat_applicable,
      escrow_required: data.escrow_required,
      
      // Metadata
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Transform engine format back to form data
   */
  private transformFromEngineFormat(data: any): FeaslyModelFormData {
    return {
      project_name: data.project_name || '',
      description: data.description || '',
      location: data.location || '',
      currency_code: data.currency_code || 'SAR',
      
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      completion_date: data.completion_date ? new Date(data.completion_date) : undefined,
      duration_months: data.duration_months || undefined,
      
      site_area_sqm: data.site_area_sqm || undefined,
      total_gfa_sqm: data.total_gfa_sqm || undefined,
      
      land_cost: data.land_cost || undefined,
      loan_amount: data.loan_amount || undefined,
      interest_rate: data.interest_rate || 5,
      loan_term_years: data.loan_term_years || 25,
      
      construction_items: data.construction_items || [],
      soft_cost_items: data.soft_cost_items || [],
      marketing_cost_items: data.marketing_cost_items || [],
      contingency_items: data.contingency_items || [],
      sale_lines: data.sale_lines || [],
      rental_lines: data.rental_lines || [],
      
      phasing_enabled: data.phasing_enabled || false,
      zakat_applicable: data.zakat_applicable || false,
      escrow_required: data.escrow_required || false,
    } as FeaslyModelFormData;
  }
}

// Export singleton instance
export const feaslyModelAPI = new FeaslyModelAPI();
