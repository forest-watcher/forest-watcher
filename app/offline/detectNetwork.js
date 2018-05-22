import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';

const pingToDetectNetwork = netInfo => cb => {
  const startTime = Date.now();
  const request = new XMLHttpRequest();
  request.timeout = 1000;
  request.onload = () => {
    if (request.status === 200) {
      const endTime = (new Date()).getTime();
      const fileSize = request.response.size;
      const speed = (fileSize * 8) / ((endTime - startTime) / 1000) / 1024;
      return cb(null, { netInfo, speed });
    }
    return cb(new Error(`Error loading image with code: ${request.status}`));
  };

  request.onerror = () => cb(new Error('There was a network error.'));
  request.onerror = () => cb(new Error('There was a network error.'));
  request.ontimeout = () => cb(new Error('Request timed out.'));
  request.open('GET', 'https://www.google.com/favicon.ico');
  request.responseType = 'blob';
  request.send();
};

const isOnline = (error, { netInfo }) => dispatch => dispatch(!error && netInfo);

export default dispatch => detectNetwork(pingToDetectNetwork(isOnline)(dispatch));
