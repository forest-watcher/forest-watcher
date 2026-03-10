// @flow

import type { Template } from 'types/reports.types';
import type { Geostore } from 'types/areas.types';
import i18n from 'i18next';
import { getCoords } from '@turf/invariant';
import isNumber from 'lodash/fp/isNumber';

export type AssignmentStatus = 'open' | 'on hold' | 'completed';
export const ASSIGNMENTS_STATUS_TITLE = (key: string) => {
  const values = {
    open: i18n.t('assignments.statusTitles.open'),
    'on hold': (i18n.t('assignments.statusTitles.onHold'): string),
    completed: (i18n.t('assignments.statusTitles.completed'): string)
  };
  return values[key];
};

export const getAssignmentLocationTitle = (assignment: Assignment): Array<string> => {
  if (assignment.location && assignment.location.length > 0) {
    return [
      assignment.location[0].alertType,
      Number(assignment.location[0].lat).toFixed(5),
      Number(assignment.location[0].lon).toFixed(5)
    ];
  } else if (assignment.geostore) {
    const coords = getCoords(assignment.geostore?.geojson?.features?.[0])?.flat();
    if (coords && coords.length > 0 && isNumber(coords[0])) {
      return [Number(coords[0]).toFixed(5), Number(coords[1]).toFixed(5)];
    } else if (coords && coords.length > 0) {
      return [Number(coords[0][0]).toFixed(5), Number(coords[0][1]).toFixed(5)];
    }
  }
  return [];
};

export const getAssignmentLocations = (assignment: Assignment) => {
  if (assignment.location && assignment.location.length > 0) {
    return assignment.location.map(x => ({
      ...x,
      date: assignment.createdAt.split('T')[0]
    }));
  } else if (assignment.geostore) {
    const coords = getCoords(assignment.geostore?.geojson?.features?.[0])?.flat();
    if (coords && coords.length > 0 && isNumber(coords[0])) {
      return [
        {
          lon: coords[0],
          lat: coords[1],
          date: assignment.createdAt.split('T')[0]
        }
      ];
    } else if (coords && coords.length > 0) {
      return [
        {
          lon: coords[0][0],
          lat: coords[0][1],
          date: assignment.createdAt.split('T')[0]
        }
      ];
    }
  }
  return [];
};

export const ASSIGNMENT_PRIORITY = {
  HIGH: 1,
  NORMAL: 0
};

export type AssignmentLocation = {
  lat: number,
  lon: number,
  alertType: string,
  alertId: string
};

export type Assignment = {
  id: string,
  name: string,
  location?: ?Array<AssignmentLocation>,
  geostore?: ?Geostore,
  priority: number,
  monitors: Array<string>,
  notes: string,
  status: AssignmentStatus,
  areaId: string,
  templateIds: Array<string>,
  areaName: string,
  geostore: Geostore,
  templates: Array<Template>,
  monitorNames: Array<{
    id: string,
    name: string
  }>,
  image: string,
  createdAt: string
};

export type AssignmentState = {
  data: Array<Assignment>,
  synced: boolean,
  syncing: boolean,
  refreshing: boolean,
  syncError: boolean,
  syncDate: number
};

export const AssignmentsActionNames = {
  GET_ASSIGNMENTS_REQUEST: 'assignments/GET_ASSIGNMENTS_REQUEST',
  GET_ASSIGNMENTS_COMMIT: 'assignments/GET_ASSIGNMENTS_COMMIT',
  GET_ASSIGNMENTS_ROLLBACK: 'assignments/GET_ASSIGNMENTS_ROLLBACK',
  ASSIGNMENT_ONHOLD_REQUEST: 'assignments/ASSIGNMENT_ONHOLD_REQUEST',
  ASSIGNMENT_ONHOLD_COMMIT: 'assignments/ASSIGNMENT_ONHOLD_COMMIT',
  ASSIGNMENT_ONHOLD_ROLLBACK: 'assignments/ASSIGNMENT_ONHOLD_ROLLBACK'
};

export type AssignmentAction =
  | GetAssignmentsRequest
  | GetAssignmentsCommit
  | GetAssignmentsRollback
  | AssignmentOnholdRequest
  | AssignmentOnholdCommit
  | AssignmentOnholdRollback;

export type GetAssignmentsRequest = {
  type: 'assignments/GET_ASSIGNMENTS_REQUEST',
  meta: {
    offline: any
  }
};

export type GetAssignmentsCommit = {
  type: 'assignments/GET_ASSIGNMENTS_COMMIT',
  payload: Array<Assignment>
};

export type GetAssignmentsRollback = {
  type: 'assignments/GET_ASSIGNMENTS_ROLLBACK'
};

export type AssignmentOnholdRequest = {
  type: 'assignments/ASSIGNMENT_ONHOLD_REQUEST',
  meta: {
    offline: any
  }
};

export type AssignmentOnholdCommit = {
  type: 'assignments/ASSIGNMENT_ONHOLD_COMMIT'
};

export type AssignmentOnholdRollback = {
  type: 'assignments/ASSIGNMENT_ONHOLD_ROLLBACK'
};
