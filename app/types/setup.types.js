// @flow

import type { Country } from 'types/countries.types';
import type { SaveAreaRequest, SaveAreaCommit, SaveAreaRollback } from 'types/areas.types';

export type CountryArea = {
  name: string,
  geojson: ?Object,
  wdpaid: ?number,
  id: ?string
};

export type SetupState = {
  country: ?Country,
  area: CountryArea,
  snapshot: string,
  error: boolean
};

export type SetupAction = InitSetup | SetCountry | SetAoi | SaveAreaRequest | SaveAreaCommit | SaveAreaRollback;

export type InitSetup = { type: 'setup/INIT_SETUP' };
export type SetCountry = { type: 'setup/SET_COUNTRY', payload: Country };
export type SetAoi = { type: 'setup/SET_AOI', payload: { area: CountryArea, snapshot: string } };
