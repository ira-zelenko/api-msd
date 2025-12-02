
export interface PeriodEntry {
  _id: string;
  periodType:'daily' | 'weekly' | 'monthly';
  periodKey: string;
  carrier: string;
  shipvia: string;
  distributionCenter: string;
  customer: string;
  weight: number;
  spent: number;
  volume: number;
  costPerLB: number;
  costPerParcel: number;
}
