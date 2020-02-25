import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

// Temporal reducer to get rid of the redux-form dependency
// during the transition we have to migrate the old data to
// the new report ansers template and mark the migration as done
// as initialState mark it as migrated for new users
const initialState = {
  migrated: true,
  oldData: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      const { form } = action.payload;
      if (!form) {
        return initialState;
      }
      return !form.migrated ? { migrated: true, oldData: form } : { ...form };
    }
    default:
      return state;
  }
}
