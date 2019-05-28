// @flow
export type RouteState = {
  currentlyTrackingLocation: Location,
  previousRoutes: Array<Route>
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

export type RouteAction = setCurrentlyTracking;

export type setCurrentlyTracking = { type: 'app/SET_CURRENTLY_TRACKING', payload: boolean };
