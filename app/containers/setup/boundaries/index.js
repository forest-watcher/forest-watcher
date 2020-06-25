// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSetupArea } from 'redux-modules/setup';

import SetupBoundaries from 'components/setup/boundaries';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  const coordinates = state.setup.area.geojson ? state.setup.area.geojson.coordinates[0] : [];
  return {
    coordinates,
    setupCountry: state.setup.country
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setSetupArea
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(SetupBoundaries);
