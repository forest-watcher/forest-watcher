// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSetupAOI, storeGeostore } from 'redux-modules/setup';
import { getContextualLayer } from 'helpers/map';

import SetupBoundaries from 'components/setup/boundaries';

function mapStateToProps(state: State) {
  const contextualLayer = getContextualLayer(state.layers);
  return {
    contextualLayer,
    user: state.user.data,
    countries: state.countries.data,
    setupCountry: state.setup.country
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  storeGeostore,
  setSetupArea: setSetupAOI
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupBoundaries);
