import { Platform } from 'react-native';
import Config from 'react-native-config';

const isIOS = Platform.OS === 'ios';

export default {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: isIOS ? Config.LOGIN_GOOGLE_CLIENT_ID_IOS : Config.LOGIN_GOOGLE_CLIENT_ID_ANDROID,
    redirectUrl: `${isIOS ? Config.LOGIN_GOOGLE_REDIRECT_SCHEMA_IOS : Config.LOGIN_GOOGLE_REDIRECT_SCHEMA_ANDROID}:/oauth2redirect/google`,
    scopes: ['openid', 'profile']
  },
  facebook: ['public_profile', 'email']
};
