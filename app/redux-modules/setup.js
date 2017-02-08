// Actions
const SET_COUNTRY = 'setup/SET_COUNTRY';
const SET_AOI = 'setup/SET_AOI'; // AOI = Area of interest

// Reducer
const initialState = {
  country: {},
  area: {
    name: '',
    geostore: '',
    wdpaid: 0,
    userId: ''
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
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
      return Object.assign({}, state, { area: action.payload });
    default:
      return state;
  }
}

export function setSetupCountry(country) {
  return {
    type: SET_COUNTRY,
    payload: country
  };
}

export function setSetupWdpaid(aoi) {
  return {
    type: SET_AOI,
    payload: aoi
  };
}
