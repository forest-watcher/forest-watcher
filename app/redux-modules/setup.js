// @flow
import type { SetupState, SetupAction, CountryArea } from 'types/setup.types';
import type { Country } from 'types/countries.types';

// Actions
import { SAVE_AREA_COMMIT, SAVE_AREA_ROLLBACK } from 'redux-modules/areas';

const INIT_SETUP = 'setup/INIT_SETUP';
const SET_COUNTRY = 'setup/SET_COUNTRY';
const SET_AOI = 'setup/SET_AOI'; // AOI = Area of interest


// Reducer
const initialState = {
  country: null,
  area: {
    name: '',
    geostore: '',
    wdpaid: 0,
    id: null
  },
  snapshot: '',
  areaSaved: false
};

export default function reducer(state: SetupState = initialState, action: SetupAction): SetupState {
  switch (action.type) {
    case INIT_SETUP: {
      return initialState;
    }
    case SET_COUNTRY: {
      if (typeof action.payload.centroid === 'string' && action.payload.bbox === 'string') {
        const country = {
          name: action.payload.name,
          iso: action.payload.iso,
          centroid: action.payload.centroid ? JSON.parse(action.payload.centroid) : action.payload.centroid,
          bbox: action.payload.bbox ? JSON.parse(action.payload.bbox) : action.payload.bbox
        };
        return Object.assign({}, state, { country });
      }
      return state;
    }
    case SET_AOI:
      return Object.assign({}, state, {
        area: action.payload.area,
        snapshot: action.payload.snapshot
      });
    case SAVE_AREA_COMMIT: {
      const area = { ...state.area, id: action.payload.id };
      return Object.assign({}, state, { areaSaved: true, area });
    }
    case SAVE_AREA_ROLLBACK: {
      return { ...state, areaSaved: false };
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

export function setSetupAOI(area: CountryArea, snapshot: string): SetupAction {
  return {
    type: SET_AOI,
    payload: {
      area,
      snapshot
    }
  };
}
