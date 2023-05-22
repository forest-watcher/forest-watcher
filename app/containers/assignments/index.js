// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { Assignments } from 'components/assignments';

import { connect } from 'react-redux';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    assignments: state.assignments.data.filter(assignment => state.areas.data.find(x => x.id === assignment.areaId)),
    areas: state.areas.data
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {};
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Assignments): Class<any> & ((props: any) => React$Element<any>));
