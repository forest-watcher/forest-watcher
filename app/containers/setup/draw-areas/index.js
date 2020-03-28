// @flow
import type { State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import { getActiveBasemap } from 'redux-modules/layerSettings';
import { connect } from 'react-redux';
import DrawAreas from 'components/setup/draw-areas';

function mapStateToProps(state: State) {
  const basemap = getActiveBasemap(state);
  return {
    basemap
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawAreas);
