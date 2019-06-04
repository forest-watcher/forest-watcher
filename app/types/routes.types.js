// @flow
export type RouteState = {
  activeRoute: Route,
  previousRoutes: Array<Route>
};

export type Route = {
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
  latitude: number,
  longitude: number,
  timestamp: number
};

export type RouteAction = setRouteDestination | finishAndSaveRoute;

type setRouteDestination = { type: 'app/SET_ROUTE_DESTINATION', payload: Location };
type finishAndSaveRoute = { type: 'app/FINISH_AND_SAVE_ROUTE', payload: Route };
