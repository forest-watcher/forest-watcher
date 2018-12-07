// @flow
import type { SetupState, SetupAction, CountryArea } from 'types/setup.types';
import type { Country } from 'types/countries.types';

// Actions
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';

const INIT_SETUP = 'setup/INIT_SETUP';
const SET_COUNTRY = 'setup/SET_COUNTRY';
const SET_AOI = 'setup/SET_AOI'; // AOI = Area of interest

// Reducer
const initialState = {
  country: null,
  area: {
    name: '',
    geojson: null,
    wdpaid: 0,
    id: null
  },
  snapshot: '',
  error: false
};

export default function reducer(state: SetupState = initialState, action: SetupAction): SetupState {
  switch (action.type) {
    case INIT_SETUP: {
      return { ...initialState, country: state.country };
    }
    case SET_COUNTRY: {
      if (typeof action.payload.centroid === 'string' && typeof action.payload.bbox === 'string') {
        const country = {
          name: action.payload.name,
          iso: action.payload.iso,
          centroid: action.payload.centroid ? JSON.parse(action.payload.centroid) : action.payload.centroid,
          bbox: action.payload.bbox ? JSON.parse(action.payload.bbox) : action.payload.bbox
        };
        return { ...state, country };
      }
      return state;
    }
    case SET_AOI: {
      const { area, snapshot } = action.payload;
      return { ...state, area, snapshot };
    }
    case SAVE_AREA_ROLLBACK: {
      const { area, snapshot } = action.meta;
      return { ...state, area, snapshot };
    }
    default:
      return state;
  }
}

export function initSetup(): SetupAction {
  return {
    type: INIT_SETUP
  };
}

export function setSetupCountry(country: Country): SetupAction {
  return {
    type: SET_COUNTRY,
    payload: country
  };
}

export function setSetupArea(setup: { area: CountryArea, snapshot: string }): SetupAction {
  const { area, snapshot } = setup;
  return {
    type: SET_AOI,
    payload: {
      area,
      snapshot
    }
  };
}
