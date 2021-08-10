import defaultEffect from '@redux-offline/redux-offline/lib/defaults/effect';
import FWError from 'helpers/fwError';

const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const deserializeOptions = {
  keyForAttribute: 'camelCase'
};

export default function effect({ url, headers, errorCode, deserialize = true, ...params }, { auth, ...action }) {
  if (url && typeof url === 'string') {
    const authedHeaders = { ...headers };
    // Only add `Authorization` header if don't already have x-api-token header
    if (!authedHeaders['x-api-key']) {
      authedHeaders['Authorization'] = `Bearer ${auth}`;
    }
    const req = {
      ...params,
      url,
      headers: authedHeaders
    };
    const canDeserialize = res => res && typeof res === 'object' && res.data && deserialize;
    return defaultEffect(req, action)
      .then(data => (canDeserialize(data) ? new JSONAPIDeserializer(deserializeOptions).deserialize(data) : data))
      .catch(err => {
        if (errorCode) {
          throw new FWError({ message: err, status: errorCode });
        }
        throw err;
      });
  }

  throw new TypeError();
}
