// @flow
export type RouteState = {
  activeRoute: ?Route,
  previousRoutes: Array<Route>
};

export type RouteDifficulty = 'easy' | 'medium' | 'hard';

export type Route = {
  id: string,
  areaId: string,
  name: string,
  startDate: number,
  endDate: ?number,
  difficulty: RouteDifficulty,
  destination: Location,
  locations: Array<LocationPoint>,
  isImported?: true
};

export type Location = {
  latitude: number,
  longitude: number
};

export type LocationPoint = {
  accuracy: number,
  altitude: number,
  latitude: number,
  longitude: number,
  timestamp: number
};

export type RouteDeletionCriteria = {
  id?: string,
  areaId?: string
};

export type RouteAction =
  | FinishAndSaveRoute
  | DeleteRouteAction
  | UpdateActiveRoute
  | UpdateSavedRoute
  | DiscardActiveRoute
  | ImportRoute;

type UpdateActiveRoute = {
  type: 'routes/UPDATE_ACTIVE_ROUTE',
  payload: $Shape<Route>
};
type UpdateSavedRoute = { type: 'routes/UPDATE_SAVED_ROUTE', payload: $Shape<Route> };
type FinishAndSaveRoute = { type: 'routes/FINISH_AND_SAVE_ROUTE' };
type DeleteRouteAction = { type: 'routes/DELETE_ROUTE', payload: RouteDeletionCriteria };
type DiscardActiveRoute = { type: 'routes/DISCARD_ACTIVE_ROUTE' };
type ImportRoute = { type: 'routes/IMPORT_ROUTE', payload: Route };
