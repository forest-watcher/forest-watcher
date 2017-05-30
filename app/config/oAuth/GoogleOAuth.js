/* eslint no-underscore-dangle: 0 */
import { GoogleSignin } from 'react-native-google-signin';
import Config from 'react-native-config';

class GoogleOAuth {
  constructor() {
    this._googleSignIn = null;
  }

  /**
   * Configures the GoogleSignin object if needed
   * @returns {Promise} - GoogleSignin configuration promise
   * @private
   */
  _start() {
    if (!this._googleSignIn) {
      this._googleSignIn = GoogleSignin.configure({
        iosClientId: Config.LOGIN_GOOGLE_CLIENT_ID_IOS,
        webClientId: Config.LOGIN_GOOGLE_CLIENT_ID_ANDROID,
        offlineAccess: false,
        hostedDomain: '',
        forceConsentPrompt: true,
        accountName: ''
      });
    }
    return this._googleSignIn;
  }

  /**
   * Login and return the user
   * @returns {Promise} - GoogleSignin signIn promise
   */
  async login() {
    await this._start();
    return GoogleSignin.signIn();
  }

  /**
   * Logout and return response
   * @returns {Promise} - GoogleSignin revokeAccess promise
   */
  async logout() {
    await this._start();
    return GoogleSignin.revokeAccess();
  }
}

export default new GoogleOAuth();
