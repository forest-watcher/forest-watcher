// @flow

import type {
  Store as ReduxStore,
  Dispatch as ReduxDispatch
} from 'redux';
import type {
  OfflineState
} from '@redux-offline/redux-offline/src/types';

import type { UserAction, UserState } from 'types/user.types';
import type { AppState } from 'types/app.types';
import type { CountriesState } from 'types/countries.types';
import type { SetupState } from 'types/setup.types';

type Action = UserAction;

export type State = {
  app: AppState,
  user: UserState,
  offline: OfflineState,
  countries: CountriesState,
  setup: SetupState
};

export type Store = ReduxStore<State, Action>;
export type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;

export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action> & Thunk<Action>;
