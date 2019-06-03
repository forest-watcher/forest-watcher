// @flow
export type RouteState = {
  routeDestination: Location,
  previousRoutes: Array<Route>,
  currentRoute: Route
};

export type Route = {
  name: string,
  locations: Array<LocationPoint>,
  date: number,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string
};

export type Location = {
  latitude: number,
  longitude: number
};

export type LocationPoint = {
  latitude: number,
  longitude: number,
  timestamp: number
};

export type RouteAction = setRouteDestination | finishAndSaveRoute;

type setRouteDestination = { type: 'app/SET_ROUTE_DESTINATION', payload: Location };
type finishAndSaveRoute = { type: 'app/FINISH_AND_SAVE_ROUTE', payload: Route };
