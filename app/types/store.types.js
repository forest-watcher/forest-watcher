// @flow

import type {
  Store as ReduxStore,
  Dispatch as ReduxDispatch
} from 'redux';
import type {
  OfflineState
} from '@redux-offline/redux-offline/src/types';

import type { UserAction, UserState } from 'types/user.types';
import type { ReportsAction, ReportsState } from 'types/reports.types';
import type { AppAction, AppState } from 'types/app.types';
import type { CountriesAction, CountriesState } from 'types/countries.types';
import type { SetupAction, SetupState } from 'types/setup.types';

type Action =
  | UserAction
  | ReportsAction
  | AppAction
  | CountriesAction
  | SetupAction;

export type State = {
  app: AppState,
  user: UserState,
  offline: OfflineState,
  countries: CountriesState,
  setup: SetupState,
  reports: ReportsState
};

export type Store = ReduxStore<State, Action>;
export type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;

export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action> & Thunk<Action>;
