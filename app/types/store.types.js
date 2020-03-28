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
import type { BasemapsAction, BasemapsState } from 'types/basemaps.types';

export type Action =
  | UserAction
  | ReportsAction
  | AppAction
  | BasemapsAction
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
  basemaps: BasemapsState,
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
export type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;

export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action> & Thunk<Action>;
