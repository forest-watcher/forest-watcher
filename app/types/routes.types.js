// @flow
import type { LogoutRequest } from './user.types';
import type { Coordinates } from 'types/common.types';

export type RouteState = {
  activeRoute: ?Route,
  previousRoutes: Array<Route>,
  syncing: ?boolean,
  synced: ?boolean
};

// eslint-disable-next-line import/no-unused-modules
export type RouteDifficulty = 'easy' | 'medium' | 'hard';

export type Route = {
  id: string,
  areaId: string,
  // The geostore ID is used to download route tiles for offline use.
  // It can be null - however if it is when the route cannot be downloaded!
  geostoreId: ?string,
  name: string,
  startDate: number,
  endDate: ?number,
  difficulty: RouteDifficulty,
  destination: Coordinates,
  locations: Array<LocationPoint>,
  isImported?: true,
  routeId?: string,
  status?: 'draft' | 'completed' | 'uploaded',
  teamId?: ?string
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
  | ImportRoute
  | UploadRouteRequest
  | UploadRouteCommit
  | UploadRouteRollback
  | FetchRoutesRequest
  | FetchRoutesCommit
  | FetchRoutesRollback
  | DeleteRouteRequest
  | DeleteRouteCommit
  | DeleteRouteRollback
  | LogoutRequest;

type UpdateActiveRoute = {
  type: 'routes/UPDATE_ACTIVE_ROUTE',
  payload: $Shape<Route>
};
type UpdateSavedRoute = { type: 'routes/UPDATE_SAVED_ROUTE', payload: $Shape<Route> };
type FinishAndSaveRoute = { type: 'routes/FINISH_AND_SAVE_ROUTE' };
type DeleteRouteAction = { type: 'routes/DELETE_ROUTE', payload: RouteDeletionCriteria };
type DiscardActiveRoute = { type: 'routes/DISCARD_ACTIVE_ROUTE' };
type ImportRoute = { type: 'routes/IMPORT_ROUTE', payload: Route };

type UploadRouteRequest = { type: 'routes/UPLOAD_ROUTE_REQUEST', meta: { offline: any } };
type UploadRouteCommit = { type: 'routes/UPLOAD_ROUTE_COMMIT', meta: { routes: Array<Route> } };
type UploadRouteRollback = { type: 'routes/UPLOAD_ROUTE_ROLLBACK' };

type FetchRoutesRequest = { type: 'routes/FETCH_ROUTES_REQUEST', meta: { offline: any } };
type FetchRoutesCommit = { type: 'routes/FETCH_ROUTES_COMMIT', payload: Array<Route> };
type FetchRoutesRollback = { type: 'routes/FETCH_ROUTES_ROLLBACK' };

type DeleteRouteRequest = { type: 'routes/DELETE_ROUTE_REQUEST', meta: { offline: any } };
type DeleteRouteCommit = { type: 'routes/DELETE_ROUTE_COMMIT' };
type DeleteRouteRollback = { type: 'routes/DELETE_ROUTE_ROLLBACK' };
