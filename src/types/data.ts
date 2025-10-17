export type Metric = 'volume' | 'spend' | 'weight' | 'costPerLB' | 'costPerParcel';
export type Dimension = 'carrier' | 'shipvia' | 'distributionCenter' | 'customer';

export interface MetricsValues {
  spend: number;
  volume: number;
  weight: number;
  costPerLB: number;
  costPerParcel: number;
}

export interface Dimensions {
  carrier: Record<string, MetricsValues>;
  shipvia: Record<string, MetricsValues>;
  distributionCenter: Record<string, MetricsValues>;
  customer: Record<string, MetricsValues>;
}

export interface PeriodEntry {
  _id: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodKey: string;
  referenceDate: string;
  dimensions: Dimensions;
}
