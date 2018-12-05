import Config from 'react-native-config';

export default {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: Config.LOGIN_GOOGLE_CLIENT_ID,
    redirectUrl: `${Config.LOGIN_GOOGLE_REDIRECT_SCHEMA}:/oauth2redirect/google`,
    scopes: ['openid', 'profile']
  },
  facebook: ['public_profile', 'email']
};
