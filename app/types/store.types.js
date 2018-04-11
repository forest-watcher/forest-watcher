// @flow

import type {
  Store as ReduxStore,
  Dispatch as ReduxDispatch
} from 'redux';
import type {
  OfflineState
} from '@redux-offline/redux-offline/src/types';

import type { UserAction, UserState } from 'types/user.types';

type Action = UserAction;

export type State = {
  user: UserState,
  offline: OfflineState
};

export type Store = ReduxStore<State, Action>;
export type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;

export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action> & Thunk<Action>;
