import type { OfflineMeta } from 'types/offline';

import { GET_USER_REQUEST } from 'redux-modules/user';

export type UserAction = GetUser;

export type GetUser = { type: GET_USER_REQUEST, meta: OfflineMeta };
