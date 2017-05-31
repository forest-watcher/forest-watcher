import { AppState, NetInfo } from 'react-native'; // eslint-disable-line import/no-unresolved

export default callback => {
  let wasOnline;
  const updateState = reach => {
    const isOnline = reach.toUpperCase() !== 'NONE';
    if (wasOnline !== isOnline) {
      wasOnline = isOnline;
      callback({ online: isOnline, netInfo: reach });
    }
  };

  NetInfo.addEventListener('change', updateState);
  NetInfo.fetch().then(updateState);
  AppState.addEventListener('change', () => {
    NetInfo.fetch().then(updateState);
  });
};
