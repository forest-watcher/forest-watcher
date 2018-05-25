import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';

class DetectNetworkPing {
  static urlList = [
    'https://know-it-all.io', // fastest web in the world (not really, real fast though)
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
  pingToDetectNetwork = cb => netInfo => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 1000;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        cb(null, { netInfo });
      }
    };
    xhr.onerror = () => cb(new Error('There was a network error.'), netInfo);
    xhr.ontimeout = () => cb(new Error('Request timed out.'), netInfo);

    const index = this.count % DetectNetworkPing.urlList.length;
    xhr.open('HEAD', DetectNetworkPing.urlList[index]);
    if (netInfo.online) {
      xhr.send();
    } else {
      cb(null, { netInfo });
    }
  };
  isOnline = dispatch => (error, { netInfo } = {}) => {
    if (error) {
      if (this.count === 0) dispatch({ ...netInfo, online: false });
      if (this.count < DetectNetworkPing.decaySchedule.length) {
        setTimeout(
          () => this.pingToDetectNetwork(this.isOnline(dispatch))(netInfo),
          DetectNetworkPing.decaySchedule[this.count]
        );
        this.count += 1;
      }
    } else {
      this.count = 0;
      dispatch(netInfo);
    }
  };
  start = dispatch => detectNetwork(this.pingToDetectNetwork(this.isOnline(dispatch)))
}

const detector = new DetectNetworkPing();

export default detector.start;
