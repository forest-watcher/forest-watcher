import defaultEffect from 'redux-offline/lib/defaults/effect';

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
      .then((data) => (canDeserialize(data) ? new JSONAPIDeserializer(deserializeOptions).deserialize(data) : data));
  } else if (typeof promise !== 'undefined') {
    return promise
      .then(data => data)
      .catch(err => {
        console.warn('offline effect error', JSON.stringify(err, null, '  '));
        return Promise.reject({ msg: 'Error in custom promise offline handler', status: errorCode });
      });
  }
  throw new TypeError();
}
