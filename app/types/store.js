import type {
  Store as ReduxStore,
  Dispatch as ReduxDispatch
} from 'redux';

import type { UserAction, UserState } from 'types/user';

type State = UserState;
type Action = UserAction;

export type Store = ReduxStore<State, Action>;
export type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;

export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action> & Thunk<Action>;
