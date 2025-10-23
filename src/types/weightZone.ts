export interface WeightZonePoint {
  zone: number;
  weight: number;
  intensity: number;
}

export type MetricKey =
  | "spend_usd"
  | "spend_percent"
  | "volume_parcel"
  | "volume_percent"
  | "cost_per_parcel"
  | "cost_per_lb";

export type WeightZoneMetrics = Record<MetricKey, WeightZonePoint[]>;

export interface WeightZoneDocument {
  _id?: string;
  date: Date;
  metrics: WeightZoneMetrics;
  createdAt: Date;
  updatedAt: Date;
}
