// @flow

// Defines a list of shared action types, that may be emitted but then
// observed by various different reducers.
//
// This removes the possibility of require cycles that could have
// unintended side effects
export const RETRY_SYNC = 'app/RETRY_SYNC';


export const CREATE_REPORT = 'report/CREATE_REPORT';
