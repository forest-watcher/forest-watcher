import defaultEffect from 'redux-offline/lib/defaults/effect';

const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const deserializeOptions = {
  keyForAttribute: 'camelCase'
};

export default function effect(params, { auth, ...action }) {
  const { url, headers, promise, errorCode } = params;
  if (url && typeof url === 'string') {
    const req = {
      ...params,
      headers: { ...headers, Authorization: `Bearer ${auth}` }
    };
    return defaultEffect(req, action)
      .then((data) => new JSONAPIDeserializer(deserializeOptions).deserialize(data));
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
