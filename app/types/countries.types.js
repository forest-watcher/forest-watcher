// @flow

import type { LogoutRequest } from 'types/user.types';

export type Country = {
  name: string,
  iso: string,
  centroid: string,
  bbox: string
}
type CountriesData = Array<Country>;
export type CountriesState = {
  data: CountriesData,
  synced: boolean,
  syncing: boolean
};

export type CountriesAction =
  | GetCountriesRequest
  | GetCountriesCommit
  | GetCountriesRollback
  | LogoutRequest;

export type GetCountriesRequest = { type: 'countries/GET_COUNTRIES_REQUEST' };
export type GetCountriesCommit = { type: 'countries/GET_COUNTRIES_COMMIT', payload: { data: CountriesData } };
export type GetCountriesRollback = { type: 'countries/GET_COUNTRIES_ROLLBACK' };
