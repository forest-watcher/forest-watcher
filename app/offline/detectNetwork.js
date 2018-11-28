import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';
import Config from 'react-native-config';

class DetectNetworkPing {
  static urlList = [
    Config.API_URL,
    'https://www.globalforestwatch.org',
    'https://www.google.com',
    'https://www.facebook.com',
    'https://www.amazon.com'
  ];
  static decaySchedule = [
    1000, // After 1 seconds
    1000 * 5, // After 5 seconds
    1000 * 15, // After 15 seconds
    1000 * 30, // After 30 seconds
    1000 * 60, // After 1 minute
    1000 * 60 * 3, // After 3 minutes
    1000 * 60 * 5, // After 5 minutes
    1000 * 60 * 10, // After 10 minutes
    1000 * 60 * 30, // After 30 minutes
    1000 * 60 * 60 // After 1 hour
  ];
  count = 0;
  pingToDetectNetwork = cb => connection => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 1000;
    xhr.onreadystatechange = () => {
      if (xhr.status > 0) {
        xhr.onreadystatechange = null;
        cb(null, connection);
      }
    };
    xhr.onerror = () => cb(new Error('There was a network error.'), connection);
    xhr.ontimeout = () => cb(new Error('Request timed out.'), connection);

    const index = this.count % DetectNetworkPing.urlList.length;
    xhr.open('HEAD', DetectNetworkPing.urlList[index]);
    if (connection.online) {
      xhr.send();
    } else {
      cb(null, connection);
    }
  };
  isOnline = dispatch => (error, connection) => {
    if (error) {
      if (this.count === 0) dispatch({ ...connection, online: false });
      if (this.count < DetectNetworkPing.decaySchedule.length) {
        setTimeout(
          () => this.pingToDetectNetwork(this.isOnline(dispatch))(connection),
          DetectNetworkPing.decaySchedule[this.count]
        );
        this.count += 1;
      }
    } else {
      this.count = 0;
      dispatch(connection);
    }
  };
  start = dispatch => detectNetwork(this.pingToDetectNetwork(this.isOnline(dispatch)))
}

const detector = new DetectNetworkPing();

export default detector.start;
