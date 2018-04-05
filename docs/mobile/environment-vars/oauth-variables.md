## OAuth variables

Set this callback urls to redirect after the login succeeds
```bash
API_AUTH=https://production-api.globalforestwatch.org
API_AUTH_CALLBACK_URL=https://production-api.globalforestwatch.org/auth/success
```

### Google oAuth
To set up Google oAuth you'll need the following env vars:
```bash
LOGIN_GOOGLE_CLIENT_ID_ANDROID=
LOGIN_REDIRECT_SCHEMA_ANDROID=

LOGIN_GOOGLE_CLIENT_ID_IOS=
LOGIN_REDIRECT_SCHEMA_IOS=
```
To generate this values follow the next steps:
1. Log into [Google API Console](https://console.developers.google.com/apis) and create a project.
2. Open the credentials section and inside the _create credentials_ dropdown select: `oAuth client-id`.
3. You'll need to select a type: Android or iOS (create one for each platform if you wish to support both of them).
  - For iOS copy the client-id and the iOS URL scheme.
  - For Android copy the client-id and use the chosen package name as redirect url.

[Read more...](https://developers.google.com/identity/protocols/OAuth2InstalledApp)

### Facebook SDK oAuth
To set up Facebook authentication you'll need the following env vars:
```bash
LOGIN_FACEBOOK_APP_ID=
LOGIN_FACEBOOK_PROTOCOL_SCHEME=
```
In order to generate this values follow the next steps:
1. Create a [Facebook Developer Account](developers.facebook.com) (a regular facebook account is required).
2. Once you have set your FB developer account, add a new Facebook application.
3. Afterwards, inside the products menu of your app select _Facebook Login_.
4. Head over to `Facebook Login/Quickstart` on the left sidebar.
5. Select Android (there's no need to download or modify any code this has already been done). Fill the following fields:
  - Package Name.
  - Default Activity Class Name.
  - Key Hashes, it's really important that you generate a dev hash for every environment, and a release hash for production.
  - In step 6 you'll find the env var values that you need (should be the same in Android and iOS).
6. Select Apple (same case, no need to add any code). Fill the following fields:
  - Bundle ID
  - In step 4 you'll find the env var values that you need (should be the same in Android and iOS).

To setup facebook authentication from scratch you'll need to follow the instructions in these links:

**Android**
1. Follow all steps in `Facebook Login/Quickstart/Android`.
2. Follow the instructions [here](https://developers.facebook.com/docs/react-native/configure-android-current)
3. The previously linked docs aren't 100% accurate, you'll need to add this to `MainApplication.java` instead:
```java
@Override
  public void onCreate() {
    super.onCreate();

    setActivityCallbacks(new ActivityCallbacks() {
      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent data) {
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
      }
    });
  }
```

**iOS**
1. Follow steps 1-5 in `Facebook Login/Quickstart/iOS`.
2. In step 4, replace the app id and CFBundleURLSchemes with `__RN_CONFIG_LOGIN_FACEBOOK_APP_ID` and `__RN_CONFIG_LOGIN_FACEBOOK_PROTOCOL_SCHEME`
3. Running the following will install the Facebook SDK
```bash
# install node modules
npm i
# install pods
(cd ios; pod install;)
# link sdk to project
react-native link react-native-fbsdk
```
4. If you get an "FBSDKShareKit/FBSDKShareKit.h file not found" error, the easiest way out is to remove all references to it in the FBSDK and remove the share folder from ios folder in `react-native-fbsdk` node module.


