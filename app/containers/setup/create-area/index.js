// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CreateArea from 'components/setup/create-area';
import { setSetupArea, startImport } from 'redux-modules/setup';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    imported: state.setup.imported
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setSetupArea,
      startImport
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;

export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(CreateArea);
