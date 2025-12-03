export type MetricKey =
  | "spent"
  | "spentPercent"
  | "volume"
  | "volumePercent"
  | "costPerParcel"
  | "costPerLB";

export interface ZoneWeightMetrics {
  spent: number,
  spentPercent: number,
  volume: number,
  volumePercent: number,
  costPerLB: number,
  costPerParcel: number,
}

export interface ZonesData {
  [zone: string]: {
    [weight: string]: ZoneWeightMetrics;
  };
}

export interface WeightZoneRecord {
  _id?: string;
  periodType: "daily" | "weekly" | "monthly";
  periodKey: string;
  carrier: string;
  shipvia: string;
  distributionCenter: string;
  customer: string;
  zones: ZonesData;
  createdAt?: string;
  updatedAt?: string;
}

