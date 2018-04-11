// @flow

import type { Country } from 'types/countries.types';
import type { SaveAreaCommit, SaveAreaRollback } from 'types/area.types';

export type CountryArea = {
  name: string,
  geostore: string,
  wdpaid: number,
  userId: string,
  id: ?string
};

export type SetupState = {
  country: Country,
  area: CountryArea,
  snapshot: string,
  areaSaved: boolean
};

export type SetupAction =
  | InitSetup
  | SetCountry
  | SetAoi
  | SaveAreaCommit
  | SaveAreaRollback;

export type InitSetup = { type: 'setup/INIT_SETUP' };
export type SetCountry = { type: 'setup/SET_COUNTRY', payload: Country };
export type SetAoi = { type: 'setup/SET_COUNTRY', payload: { area: CountryArea, snapshot: string } };

