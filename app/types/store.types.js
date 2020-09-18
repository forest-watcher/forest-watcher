// @flow

import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import type { OfflineState } from '@redux-offline/redux-offline/src/types';

import type { UserAction, UserState } from 'types/user.types';
import type { ReportsAction, ReportsState } from 'types/reports.types';
import type { AppAction, AppState } from 'types/app.types';
import type { CountriesAction, CountriesState } from 'types/countries.types';
import type { SetupAction, SetupState } from 'types/setup.types';
import type { AreasAction, AreasState } from 'types/areas.types';
import type { AlertsAction, AlertsState } from 'types/alerts.types';
import type { LayersAction, LayersState } from 'types/layers.types';
import type { RouteAction, RouteState } from 'types/routes.types';
import type { LayerSettingsAction, LayerSettingsState } from 'types/layerSettings.types';

export type Action =
  | UserAction
  | ReportsAction
  | AppAction
  | CountriesAction
  | SetupAction
  | AreasAction
  | AlertsAction
  | LayersAction
  | LayerSettingsAction
  | RouteAction;

export type State = {
  app: AppState,
  user: UserState,
  areas: AreasState,
  offline: OfflineState,
  countries: CountriesState,
  setup: SetupState,
  reports: ReportsState,
  alerts: AlertsState,
  layers: LayersState,
  layerSettings: LayerSettingsState,
  routes: RouteState
};

export type Store = ReduxStore<State, Action>;
export type Thunk<T> = (dispatch: Dispatch, getState: GetState) => T;

export type GetState = () => State;

export type DispatchThunk = <T>(action: Thunk<T>) => T;
export type Dispatch = ReduxDispatch<Action> & DispatchThunk;

/**
 * Properties sent through to a connected component.
 *
 * Taken from https://engineering.wework.com/adventures-in-static-typing-react-redux-flow-oh-my-284c5f74adac
 */
type ExtractReturn<Fn> = $Call<<T>((...Iterable<any>) => T) => T, Fn>;
type ReduxProps<M, D> = $ReadOnly<{|
  ...ExtractReturn<M>,
  ...ExtractReturn<D>
|}>;
export type ComponentProps<OP, MSP, MDP> = {|
  ...OP,
  ...ReduxProps<MSP, MDP>
|};
