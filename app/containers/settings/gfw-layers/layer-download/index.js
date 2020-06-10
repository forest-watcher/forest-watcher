// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LayerDownload from 'components/settings/gfw-layers/layer-download';
import { importGFWContextualLayer } from 'redux-modules/layers';

import type { ContextualLayer } from 'types/layers.types';

type OwnProps = {|
  +componentId: string,
  layer: ContextualLayer
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {};
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      addLayer: importGFWContextualLayer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(LayerDownload);
