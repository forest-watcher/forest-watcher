// @flow

import type { Dispatch, GetState } from 'types/store.types';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/src/constants';

import Config from 'react-native-config';
import {
  AssignmentsActionNames,
  type AssignmentState,
  type AssignmentAction,
  type Assignment
} from 'types/assignments.types';

const initialState: AssignmentState = {
  data: [],
  synced: false,
  syncing: false,
  refreshing: false,
  syncError: false,
  syncDate: Date.now()
};

export default function reducer(state: AssignmentState = initialState, action: AssignmentAction): AssignmentState {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      return {
        ...state,
        ...action.payload.assignments
      };
    }
    case AssignmentsActionNames.GET_ASSIGNMENTS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case AssignmentsActionNames.GET_ASSIGNMENTS_COMMIT:
      return { ...state, synced: true, syncing: false, syncDate: Date.now(), data: action.payload };
    case AssignmentsActionNames.GET_ASSIGNMENTS_ROLLBACK:
      return { ...state, synced: true, syncing: false, syncError: true };
    case AssignmentsActionNames.ASSIGNMENT_ONHOLD_REQUEST:
      return { ...state, synced: false, syncing: true };
    case AssignmentsActionNames.ASSIGNMENT_ONHOLD_COMMIT:
      return { ...state, synced: true, syncing: false };
    case AssignmentsActionNames.ASSIGNMENT_ONHOLD_ROLLBACK:
      return { ...state, synced: true, syncing: false, syncError: true };
    default:
      return state;
  }
}

export function getAssignments(): AssignmentAction {
  const url = `${Config.API_V3_URL}/assignments/open`;
  return {
    type: AssignmentsActionNames.GET_ASSIGNMENTS_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: {
          type: AssignmentsActionNames.GET_ASSIGNMENTS_COMMIT
        },
        rollback: {
          type: AssignmentsActionNames.GET_ASSIGNMENTS_ROLLBACK
        }
      }
    }
  };
}

export function setAssignmentOnhold(assignment: Assignment, onhold: boolean): AssignmentAction {
  const url = `${Config.API_V3_URL}/assignments/${assignment.id}/status`;
  const body = {
    status: onhold ? 'on hold' : 'open'
  };
  return {
    type: AssignmentsActionNames.ASSIGNMENT_ONHOLD_REQUEST,
    meta: {
      offline: {
        effect: {
          url,
          method: 'PATCH',
          body: JSON.stringify(body)
        },
        commit: {
          type: AssignmentsActionNames.ASSIGNMENT_ONHOLD_COMMIT,
          meta: {
            then: payload => (dispatch, state) => {
              dispatch(getAssignments());
            }
          }
        },
        rollback: {
          type: AssignmentsActionNames.ASSIGNMENT_ONHOLD_ROLLBACK
        }
      }
    }
  };
}

export function syncAssignments(): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    const { syncing } = state().assignments;
    const { loggedIn } = state().user;
    if (!syncing && loggedIn) {
      dispatch(getAssignments());
    }
  };
}
