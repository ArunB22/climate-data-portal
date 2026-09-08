export type Domain = 'CLIMATE' | 'ENERGY' | 'POWER';

export type ChartType = 'LATLONG_MAP' | 'STATE_HEATMAP' | 'LINE' | 'BAR' | 'AREA';

export type DatasetStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminDatasetDto {
  id: string;
  domain: Domain;
  chartType: ChartType;
  title: string;
  status: DatasetStatus;
  createdAt: string;
}

export interface DatasetPayload {
  columns: string[];
  rows: Record<string, string | number | null>[];
}

export interface SuperAdminDatasetDto {
  id: string;
  domain: Domain;
  chartType: ChartType;
  title: string;
  status: DatasetStatus;
  submittedByEmail: string;
  createdAt: string;
  decidedAt: string | null;
  payload: DatasetPayload;
}

export interface PublicDatasetDto {
  id: string;
  domain: Domain;
  chartType: ChartType;
  title: string;
  publishedOrder: number;
  payload: DatasetPayload;
}

/** Whatever a chart card needs to render — satisfied structurally by both PublicDatasetDto and SuperAdminDatasetDto. */
export interface ChartableDataset {
  title: string;
  domain: Domain;
  chartType: ChartType;
  payload: DatasetPayload;
}
