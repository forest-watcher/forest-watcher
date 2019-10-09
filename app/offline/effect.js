import defaultEffect from '@redux-offline/redux-offline/lib/defaults/effect';
import FWError from 'helpers/fwError';

const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const deserializeOptions = {
  keyForAttribute: 'camelCase'
};

export default function effect({ url, headers, errorCode, deserialize = true, ...params }, { auth, ...action }) {
  if (url && typeof url === 'string') {
    const req = {
      ...params,
      url,
      headers: { ...headers, Authorization: `Bearer ${auth}` }
    };
    const canDeserialize = res => res && typeof res === 'object' && res.data && deserialize;
    return defaultEffect(req, action)
      .then(data => (canDeserialize(data) ? new JSONAPIDeserializer(deserializeOptions).deserialize(data) : data))
      .catch(err => {
        if (errorCode) return Promise.reject(new FWError({ message: err, status: errorCode }));
        throw err;
      });
  }

  throw new TypeError();
}
