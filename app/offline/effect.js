import defaultEffect from 'redux-offline/lib/defaults/effect';

export default function effect({ url, promise, errorCode }, { auth, ...action }) {
  if (url && typeof url === 'string') {
    const req = {
      url,
      headers: { Authorization: `Bearer ${auth}` }
    };
    return defaultEffect(req, action);
  } else if (typeof promise !== 'undefined') {
    return promise
      .then(data => data)
      .catch(err => {
        console.warn(err);
        return Promise.reject(errorCode);
      });
  }
  throw new TypeError();
}
