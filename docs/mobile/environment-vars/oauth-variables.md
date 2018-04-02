# OAuth variables

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

