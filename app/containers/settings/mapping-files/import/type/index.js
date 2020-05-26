// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { shouldBeConnected } from 'helpers/app';

import ImportMappingFileType from 'components/settings/mapping-files/import/type';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    isConnected: shouldBeConnected(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({}, dispatch);

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportMappingFileType);
