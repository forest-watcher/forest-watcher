import { connect } from 'react-redux';
import { setSetupAOI } from 'redux-modules/setup';
import { storeGeostore } from 'redux-modules/geostore';
import { getContextualLayer } from 'helpers/map';

import SetupBoundaries from 'components/setup/boundaries';

function mapStateToProps(state) {
  const contextualLayer = getContextualLayer(state.layers);
  return {
    contextualLayer,
    user: state.user.data,
    countries: state.countries.data,
    setupCountry: state.setup.country
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSetupArea: (area, snapshot) => {
      dispatch(setSetupAOI(area, snapshot));
    },
    storeGeostore: (id, data) => {
      dispatch(storeGeostore(id, data));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupBoundaries);
