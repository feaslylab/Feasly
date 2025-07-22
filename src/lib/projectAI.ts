import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  currency_code?: string;
  project_ai_summary?: string;
}

export interface ProjectKPI {
  irr?: number;
  roi?: number;
  totalProfit?: number;
  totalRevenue?: number;
  totalCost?: number;
}

/**
 * Generate AI project summary based on project data and KPIs
 */
export function generateProjectSummary(project: Project, kpis?: ProjectKPI): string {
  const name = project.name || '';
  const location = project.description?.match(/(Riyadh|Dubai|NEOM|Jeddah|Qiddiya|Marina|Business Bay|London|New York|Singapore)/i)?.[0] || '';
  const tag = project.tags?.[0] || '';
  const irr = kpis?.irr ? `${kpis.irr.toFixed(1)}% IRR` : '';
  const profit = kpis?.totalProfit ? `${(kpis.totalProfit / 1_000_000).toFixed(1)}M ${project.currency_code || 'AED'} net profit` : '';
  
  const parts = [
    tag || 'Project',
    location && `in ${location}`,
    irr,
    profit
  ].filter(Boolean);
  
  return parts.join(' with ') + '.';
}

/**
 * Suggest tags based on project text analysis
 */
export function suggestTagsFromText(text: string): string[] {
  const keywords = [
    { keyword: /residential|apartment|villa|housing/i, tag: 'Residential' },
    { keyword: /hospitality|hotel|resort|tourism/i, tag: 'Hospitality' },
    { keyword: /office|commercial|workspace/i, tag: 'Office' },
    { keyword: /retail|shopping|mall|store/i, tag: 'Retail' },
    { keyword: /mixed[-\s]?use/i, tag: 'Mixed Use' },
    { keyword: /luxury|premium|high[-\s]?end/i, tag: 'Luxury' },
    { keyword: /NEOM/i, tag: 'NEOM' },
    { keyword: /qiddiya/i, tag: 'Qiddiya' },
    { keyword: /riyadh|jeddah|mecca|saudi/i, tag: 'Saudi Arabia' },
    { keyword: /dubai|abu dhabi|sharjah|UAE|emirates/i, tag: 'UAE' },
    { keyword: /london|UK|britain/i, tag: 'UK' },
    { keyword: /new york|NYC|manhattan/i, tag: 'USA' },
    { keyword: /marina|waterfront|beach/i, tag: 'Waterfront' },
    { keyword: /business bay|financial district|CBD/i, tag: 'Financial District' },
    { keyword: /risk|challenging|complex/i, tag: 'High Risk' },
    { keyword: /sustainable|green|eco/i, tag: 'Sustainable' }
  ];
  
  const found: string[] = [];
  for (const k of keywords) {
    if (k.keyword.test(text) && !found.includes(k.tag)) {
      found.push(k.tag);
      if (found.length >= 3) break;
    }
  }
  return found;
}

/**
 * Update project summary in database
 */
export async function updateProjectSummary(projectId: string, summary: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ project_ai_summary: summary })
    .eq('id', projectId);
    
  if (error) {
    console.error('Error updating project summary:', error);
    throw error;
  }
}

/**
 * Generate and save project summary
 */
export async function generateAndSaveProjectSummary(project: Project, kpis?: ProjectKPI): Promise<string> {
  const summary = generateProjectSummary(project, kpis);
  await updateProjectSummary(project.id, summary);
  return summary;
}

/**
 * Log tag suggestions for analytics
 */
export async function logTagSuggestions(projectId: string, suggestedTags: string[]): Promise<void> {
  if (suggestedTags.length === 0) return;
  
  const suggestions = suggestedTags.map(tag => ({
    project_id: projectId,
    suggested_tag: tag
  }));
  
  const { error } = await supabase
    .from('project_tag_suggestions')
    .insert(suggestions);
    
  if (error) {
    console.error('Error logging tag suggestions:', error);
  }
}

/**
 * Get comprehensive search text for a project
 */
export function getProjectSearchText(project: Project): string {
  return [
    project.name,
    project.description,
    project.project_ai_summary,
    ...(project.tags || [])
  ].filter(Boolean).join(' ').toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 16): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}