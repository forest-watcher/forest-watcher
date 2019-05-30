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

export type RouteAction =
  | setRouteDestination
  | createRoute
  | createRouteDummy
  | finishAndSaveRoute
  | addLocationToRoute;

type setRouteDestination = { type: 'app/SET_ROUTE_DESTINATION', payload: Location };
type createRoute = { type: 'app/CREATE_ROUTE', payload: Route };
type createRouteDummy = { type: 'app/CREATE_ROUTE' };
type finishAndSaveRoute = { type: 'app/FINISH_AND_SAVE_ROUTE' };
type addLocationToRoute = { type: 'app/ADD_LOCATION_TO_ROUTE', payload: Location };
