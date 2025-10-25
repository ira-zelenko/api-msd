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
