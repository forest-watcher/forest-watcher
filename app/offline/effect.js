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
    const canDeserialize = ({ data }) => (typeof data === 'object' && data && deserialize);
    return defaultEffect(req, action)
      .then((data) => (canDeserialize(data) ? new JSONAPIDeserializer(deserializeOptions).deserialize(data) : data));
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

