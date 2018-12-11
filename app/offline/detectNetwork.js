import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';
import Config from 'react-native-config';

import checkConnectivity from 'helpers/networking';

export class DetectNetworkPing {
  static urlList = [
    Config.API_URL,
    'https://www.globalforestwatch.org',
    'https://www.google.com',
    'https://www.facebook.com',
    'https://www.amazon.com'
  ];

  pingToDetectNetwork = (dispatch, urlIndex) => connection => {
    /*
      This is being called when the connection status is updated (like when the WiFi / LTE is being enabled / disabled).
      If everything is off, then the connection would be offline so there’d be no need to continue.
      When it detects that WiFi or LTE has been enabled again, it should become true and then we can check for internet reachability.
      Redux-offline should handle all of that internally.
    */
    if (!connection.online) {
      dispatch(connection);
      return;
    }

    // Get URL based on current attempt number.
    const url = DetectNetworkPing.urlList[urlIndex % DetectNetworkPing.urlList.length];

    // Attempt fetch with a 1s timeout.
    return checkConnectivity(url).then(connected => {
      // If we've got a connection, update the redux state.
      if (connected) {
        dispatch({ ...connection, online: true });
        return;
      }

      // There was an error, so at this point we should state the device is offline.
      if (urlIndex === 0) {
        dispatch({ ...connection, online: false });
      }

      if (urlIndex < DetectNetworkPing.urlList.length - 1) {
        // Recall this function, incrementing the urlIndex so we try the next URL.
        this.pingToDetectNetwork(dispatch, urlIndex + 1)(connection);
      } else {
        // If every URL has failed, fail the request and stop attempting.
        dispatch({ ...connection, online: false });
      }
    });
  };

  /**
   *  Starts the network detection, with the starting URL index of 0.
   */
  start = dispatch => detectNetwork(this.pingToDetectNetwork(dispatch, 0));
}

const detector = new DetectNetworkPing();

export default detector.start;
