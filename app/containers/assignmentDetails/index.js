// @flow

import type { Assignment } from 'types/assignments.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { setAssignmentOnhold } from '../../redux-modules/assignments';

import { AssignmentDetails } from 'components/assignmentDetails';

import { connect } from 'react-redux';

type OwnProps = {
  componentId: string,
  assignment: Assignment
};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    area: state.areas.data.find(x => x.id === props.assignment.areaId),
    assignment: state.assignments.data.find(x => x.id === props.assignment.id),
    syncing: state.assignments.syncing,
    appSyncing: state.app.syncing
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    setOnHold: (assignment: Assignment, onhold: boolean) => {
      dispatch(setAssignmentOnhold(assignment, onhold));
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(AssignmentDetails): Class<any> & ((props: any) => React$Element<any>));
