import Config from 'react-native-config';

import { appleAuth } from '@invertase/react-native-apple-authentication';

export default {
  apple: {
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
  },
  google: {
    issuer: 'https://accounts.google.com',
    clientId: Config.LOGIN_GOOGLE_CLIENT_ID,
    redirectUrl: `${Config.LOGIN_GOOGLE_REDIRECT_SCHEMA}:/oauth2redirect/google`,
    scopes: ['openid', 'profile']
  },
  facebook: ['public_profile', 'email']
};
