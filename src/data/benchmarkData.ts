export interface BenchmarkData {
  id: string;
  metric: string;
  value: string;
  assetType: 'Residential' | 'Commercial' | 'Retail' | 'Office' | 'Mixed-Use';
  location: string;
  source: string;
  lastUpdated: string;
  category: 'construction' | 'sales' | 'rent' | 'returns';
}

export const BENCHMARK_DATA: BenchmarkData[] = [
  {
    id: '1',
    metric: 'Construction Cost',
    value: 'SAR 3,150 / sqm',
    assetType: 'Residential',
    location: 'Riyadh',
    source: 'MEED Projects',
    lastUpdated: '2024-01-15',
    category: 'construction'
  },
  {
    id: '2',
    metric: 'Sale Price',
    value: 'AED 1,230,000',
    assetType: 'Residential',
    location: 'Dubai',
    source: 'RERA',
    lastUpdated: '2024-01-10',
    category: 'sales'
  },
  {
    id: '3',
    metric: 'Monthly Rent',
    value: 'AED 6,400',
    assetType: 'Residential',
    location: 'Dubai',
    source: 'Bayut',
    lastUpdated: '2024-01-12',
    category: 'rent'
  },
  {
    id: '4',
    metric: 'Gross IRR',
    value: '18.2%',
    assetType: 'Residential',
    location: 'Dubai',
    source: 'Knight Frank',
    lastUpdated: '2024-01-08',
    category: 'returns'
  },
  {
    id: '5',
    metric: 'Construction Cost',
    value: 'AED 2,850 / sqm',
    assetType: 'Commercial',
    location: 'Abu Dhabi',
    source: 'ADRE',
    lastUpdated: '2024-01-14',
    category: 'construction'
  },
  {
    id: '6',
    metric: 'Sale Price',
    value: 'SAR 890,000',
    assetType: 'Residential',
    location: 'Jeddah',
    source: 'Aqar',
    lastUpdated: '2024-01-11',
    category: 'sales'
  },
  {
    id: '7',
    metric: 'Monthly Rent',
    value: 'SAR 4,200',
    assetType: 'Residential',
    location: 'Riyadh',
    source: 'Aqar',
    lastUpdated: '2024-01-13',
    category: 'rent'
  },
  {
    id: '8',
    metric: 'Gross IRR',
    value: '16.8%',
    assetType: 'Commercial',
    location: 'Riyadh',
    source: 'CBRE',
    lastUpdated: '2024-01-09',
    category: 'returns'
  },
  {
    id: '9',
    metric: 'Construction Cost',
    value: 'AED 3,200 / sqm',
    assetType: 'Retail',
    location: 'Sharjah',
    source: 'Colliers',
    lastUpdated: '2024-01-16',
    category: 'construction'
  },
  {
    id: '10',
    metric: 'Sale Price',
    value: 'AED 950,000',
    assetType: 'Residential',
    location: 'Sharjah',
    source: 'Dubizzle',
    lastUpdated: '2024-01-07',
    category: 'sales'
  }
];

export const GCC_LOCATIONS = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
  'Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Medina', 'Khobar',
  'Kuwait City', 'Doha', 'Manama', 'Muscat'
];

export const DATA_SOURCES = [
  'RERA', 'ADRE', 'MEED Projects', 'Knight Frank', 'CBRE', 'Colliers', 
  'Bayut', 'Dubizzle', 'Aqar', 'Property Finder', 'JLL'
];

export const ASSET_TYPES: BenchmarkData['assetType'][] = [
  'Residential', 'Commercial', 'Retail', 'Office', 'Mixed-Use'
];