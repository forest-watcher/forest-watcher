// @flow
export type RouteState = {
  activeRoute: Route,
  previousRoutes: Array<Route>
};

export type Route = {
  areaId: string,
  name: string,
  startDate: number,
  endDate: number,
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

export type RouteAction = updateActiveRoute | finishAndSaveRoute;

type updateActiveRoute = { type: 'route/UPDATE_ACTIVE_ROUTE', payload: Route };
type finishAndSaveRoute = { type: 'route/FINISH_AND_SAVE_ROUTE' };
