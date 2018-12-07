// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { CountriesState, CountriesAction } from 'types/countries.types';

import Config from 'react-native-config';
import { getLanguage } from 'helpers/language';
import CONSTANTS from 'config/constants';
import countriesFallback from 'config/statics/countries.json';

import { LOGOUT_REQUEST } from 'redux-modules/user';

// Actions
const GET_COUNTRIES_REQUEST = 'countries/GET_COUNTRIES_REQUEST';
const GET_COUNTRIES_COMMIT = 'countries/GET_COUNTRIES_COMMIT';
const GET_COUNTRIES_ROLLBACK = 'countries/GET_COUNTRIES_ROLLBACK';

// Reducer
const initialState = {
  data: countriesFallback,
  synced: false,
  syncing: false
};

export default function reducer(state: CountriesState = initialState, action: CountriesAction) {
  switch (action.type) {
    case GET_COUNTRIES_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_COUNTRIES_COMMIT: {
      const data = action.payload.data.filter(country => country.centroid !== null);
      return { ...state, data, synced: true, syncing: false };
    }
    case GET_COUNTRIES_ROLLBACK:
      return { ...state, syncing: false };
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
function getCountries(): CountriesAction {
  const currentLang = getLanguage();
  const nameColumnId = CONSTANTS.countries.nameColumn[currentLang] || CONSTANTS.countries.nameColumn.en;

  const url = `${Config.API_URL}/query/${Config.DATASET_COUNTRIES}?sql=
    SELECT ${nameColumnId} as name, iso, centroid, bbox
    FROM gadm28_countries WHERE ${nameColumnId} != '' ORDER BY ${nameColumnId} ASC`;

  return {
    type: GET_COUNTRIES_REQUEST,
    meta: {
      offline: {
        effect: { url, deserialize: false },
        commit: { type: GET_COUNTRIES_COMMIT },
        rollback: { type: GET_COUNTRIES_ROLLBACK }
      }
    }
  };
}

export function syncCountries() {
  return (dispatch: Dispatch, state: GetState) => {
    const { countries } = state();
    if (!countries.synced && !countries.syncing) dispatch(getCountries());
  };
}
