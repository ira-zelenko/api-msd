interface GeoStateRecord {
  _id: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodKey: string;
  state: string;
  spent: number;
  spentPercent: number;
  volume: number;
  volumePercent: number;
  costPerParcel: number;
  costPerLB: number;
  carrier: string;
  customer: string;
  distributionCenters: string;
  shipvia: string;
  zip: string;
}

interface GeoCountyRecord {
  _id: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodKey: string;
  state: string;
  county: string;
  spent: number;
  spentPercent: number;
  volume: number;
  volumePercent: number;
  costPerParcel: number;
  costPerLB: number;
  carrier: string;
  customer: string;
  distributionCenters: string;
  shipvia: string;
  zip: string;
}

export type { GeoStateRecord, GeoCountyRecord };
