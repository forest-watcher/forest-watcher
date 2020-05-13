// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { getGFWLayers } from 'redux-modules/gfwLayers';
import { connect } from 'react-redux';

import GFWLayers from 'components/settings/gfw-layers';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    fetchLayers: async (page: number) => {
      await dispatch(getGFWLayers(page));
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(GFWLayers);
