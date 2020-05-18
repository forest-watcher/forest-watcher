// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { getGFWLayers } from 'redux-modules/gfwLayers';
import { connect } from 'react-redux';

import GFWLayers from 'components/settings/gfw-layers';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  const isLoading = state.gfwLayers.syncing;
  const isPaginating = state.gfwLayers.paginating;
  return {
    layers: state.gfwLayers.data,
    loadedPage: state.gfwLayers.loadedPage,
    isInitialLoad: isLoading && !isPaginating,
    isPaginating: isPaginating,
    fullyLoaded: state.gfwLayers.fullyLoaded,
    totalLayers: state.gfwLayers.total
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    fetchLayers: async (page: number, searchTerm: ?string) => {
      await dispatch(getGFWLayers(page, searchTerm));
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(GFWLayers);
