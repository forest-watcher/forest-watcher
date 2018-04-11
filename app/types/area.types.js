// @flow
export type SaveAreaCommit = { type: 'area/SAVE_AREA_COMMIT', payload: { id: string } };
export type SaveAreaRollback = { type: 'area/SAVE_AREA_ROLLBACK', payload: { id: string } };
