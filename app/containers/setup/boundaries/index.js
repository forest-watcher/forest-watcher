// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSetupArea } from 'redux-modules/setup';
import { getContextualLayer } from 'helpers/map';

import SetupBoundaries from 'components/setup/boundaries';

function mapStateToProps(state: State) {
  const contextualLayer = getContextualLayer(state.layers);
  const coordinates = state.setup.area.geojson
    ? state.setup.area.geojson.coordinates[0]
    : [];
  return {
    coordinates,
    contextualLayer,
    user: state.user.data,
    countries: state.countries.data,
    setupCountry: state.setup.country
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  setSetupArea
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupBoundaries);
