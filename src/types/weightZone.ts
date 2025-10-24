export interface WeightZonePoint {
  [zone: string]: {
    [weight: string]: { value: number };
  };
}

export type MetricKey =
  | "spent"
  | "spent_percent"
  | "volume_parcel"
  | "volume_percent"
  | "cost_per_parcel"
  | "cost_per_lb";

export type WeightZoneMetrics = Record<MetricKey, WeightZonePoint>;

export interface WeightZoneData {
  _id?: string;
  date: Date;
  metrics: WeightZoneMetrics;
  createdAt: Date;
  updatedAt: Date;
}
