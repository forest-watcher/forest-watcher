// Actions
const INIT_SETUP = 'setup/INIT_SETUP';
const SET_COUNTRY = 'setup/SET_COUNTRY';
const SET_AOI = 'setup/SET_AOI'; // AOI = Area of interest
export const SET_AREA_SAVED = 'setup/SET_AREA_SAVED';

// Reducer
const initialState = {
  country: {},
  area: {
    name: '',
    geostore: '',
    wdpaid: 0,
    userId: '',
    id: null
  },
  snapshot: '',
  areaSaved: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case INIT_SETUP: {
      return initialState;
    }
    case SET_COUNTRY: {
      const country = {
        name: action.payload.name,
        iso: action.payload.iso,
        centroid: action.payload.centroid ? JSON.parse(action.payload.centroid) : action.payload.centroid,
        bbox: action.payload.bbox ? JSON.parse(action.payload.bbox) : action.payload.bbox
      };
      return Object.assign({}, state, { country });
    }
    case SET_AOI:
      return Object.assign({}, state, {
        area: action.payload.area,
        snapshot: action.payload.snapshot
      });
    case SET_AREA_SAVED: {
      const area = { ...state.area };
      area.id = action.payload.areaId;
      return Object.assign({}, state, { areaSaved: action.payload.status, area });
    }
    default:
      return state;
  }
}

export function initSetup() {
  return {
    type: INIT_SETUP
  };
}

export function setSetupCountry(country) {
  return {
    type: SET_COUNTRY,
    payload: country
  };
}

export function setSetupAOI(area, snapshot) {
  return {
    type: SET_AOI,
    payload: {
      area,
      snapshot
    }
  };
}
