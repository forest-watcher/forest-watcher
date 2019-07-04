// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import Basemap from 'components/map/basemap';

function mapStateToProps(state: State, ownProps: { areaId: string }) {
  const { cache } = state.layers;
  return {
    isOfflineMode: state.app.offlineMode,
    localTilePath: (ownProps.areaId && cache.basemap && cache.basemap[ownProps.areaId]) || ''
  };
}

export default connect(
  mapStateToProps,
  null
)(Basemap);
