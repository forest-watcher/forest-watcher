import { OFFLINE_STATUS_CHANGED } from 'redux-offline/lib/constants';
import { NET_INFO_CHANGED } from 'redux-modules/app';

// I'm not very fond of this solution. We should PR redux-offline in the future and handle this inside it
export const netInfoMiddleware = ({ dispatch }) => next => action => {
  if (action.type === OFFLINE_STATUS_CHANGED) {
    const { netInfo, online } = action.payload.online || {};
    dispatch({ type: NET_INFO_CHANGED, payload: netInfo });
    return next({ type: action.type, payload: { online } });
  }
  return next(action);
};

export default { netInfoMiddleware };
