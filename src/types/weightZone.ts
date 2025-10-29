export interface WeightZonePoint {
  [zone: string]: {
    [weight: string]: { value: number };
  };
}

export type MetricKey =
  | "spent"
  | "spentPercent"
  | "volumeParcel"
  | "volumePercent"
  | "costPerParcel"
  | "costPerLb";

export type WeightZoneMetrics = Record<MetricKey, WeightZonePoint>;

export interface WeightZoneData {
  _id?: string;
  date: Date;
  metrics: WeightZoneMetrics;
  createdAt: Date;
  updatedAt: Date;
}

// types/weightZone.ts
export interface ZoneWeightMetrics {
  spend: number;
  volume: number;
  weight: number;
  costPerLB: number;
  costPerParcel: number;
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
  referenceDate: string;
  carrier: string;
  shipvia: string;
  distributionCenter: string;
  customer: string;
  zones: ZonesData;
  createdAt?: string;
  updatedAt?: string;
}

