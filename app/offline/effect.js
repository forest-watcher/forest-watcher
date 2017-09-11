import defaultEffect from '@redux-offline/redux-offline/lib/defaults/effect';

const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const deserializeOptions = {
  keyForAttribute: 'camelCase'
};

export default function effect({ url, headers, promise, errorCode, deserialize = true, ...params }, { auth, ...action }) {
  if (url && typeof url === 'string') {
    const req = {
      ...params,
      url,
      headers: { ...headers, Authorization: `Bearer ${auth}` }
    };
    const canDeserialize = (res) => (res && typeof res === 'object' && res.data && deserialize);
    return defaultEffect(req, action)
      .then((data) => (canDeserialize(data) ? new JSONAPIDeserializer(deserializeOptions).deserialize(data) : data))
      .catch((err) => {
        if (errorCode) return Promise.reject({ msg: err, status: errorCode });
        throw err;
      });
  } else if (typeof promise !== 'undefined') {
    return promise
      .then(data => data)
      .catch(err => {
        console.warn('offline effect error', err.message, err.stack);
        return Promise.reject({ msg: 'Error in custom promise offline handler', status: errorCode });
      });
  }
  throw new TypeError();
}
