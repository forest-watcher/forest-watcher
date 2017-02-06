// Actions
const SET_COUNTRY = 'setup/SET_COUNTRY';
const SET_AOI_WDPAID = 'setup/SET_AOI_WDPAID';

// Reducer
const initialState = {
  country: {},
  area: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_COUNTRY:
      return Object.assign({}, state, { country: action.payload });
    case SET_AOI_WDPAID:
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

export function setSetupWdpaid(wdpaid) {
  return {
    type: SET_AOI_WDPAID,
    payload: wdpaid
  };
}
