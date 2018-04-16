// @flow
import type { Template } from 'types/reports.types';

export type Dataset = {
  slug: string,
  name: string,
  startDate: string,
  endDate: string,
  lastUpdate: number,
  _id: string,
  active: boolean,
  cache: boolean
}

export type AreaResponse = {
  name: string,
  application: string,
  geostore: string,
  userId: string,
  createdAt: string,
  image: string,
  datasets: [Dataset],
  use: Object,
  iso: Object,
  coverage: [string],
  reportTemplate: Template
}

// Actions
export type SaveAreaCommit = { type: 'areas/SAVE_AREA_COMMIT', payload: { id: string } };
export type SaveAreaRollback = { type: 'areas/SAVE_AREA_ROLLBACK', payload: { id: string } };
export type GetAreasCommit = { type: 'areas/GET_AREAS_COMMIT', payload: [AreaResponse] };
