// @flow
export type RouteState = {
  activeRoute: Route,
  previousRoutes: Array<Route>
};

export type Route = {
  id: string,
  areaId: string,
  name: string,
  saveDate: number,
  difficulty: 'easy' | 'medium' | 'hard',
  destination: Location,
  language: string,
  locations: Array<LocationPoint>
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
  id: string,
  areaId: string
};

export type RouteAction = updateActiveRoute | finishAndSaveRoute | deleteRouteAction;

type updateActiveRoute = { type: 'routes/UPDATE_ACTIVE_ROUTE', payload: Route };
type finishAndSaveRoute = { type: 'routes/FINISH_AND_SAVE_ROUTE' };
type deleteRouteAction = { type: 'routes/DELETE_ROUTE', payload: RouteDeletionCriteria };
