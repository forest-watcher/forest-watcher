# Other third party variables

## Map dependencies
To be able to use the map we need to create tokens for:
- Google maps, needed for Google maps application, get it from:
    - [Android](https://developers.google.com/maps/documentation/android-api/signup)
    - [iOS](https://developers.google.com/maps/documentation/ios-sdk/get-api-key)
- Mapbox, used for the satellite basemap, [follow this instructions](https://www.mapbox.com/help/how-access-tokens-work/#creating-and-managing-access-tokens) to generate your own key.

```bash
GOOGLE_MAPS_API_KEY_IOS=
GOOGLE_MAPS_API_KEY_ANDROID=
MAPBOX_TOKEN=
```

## Translations dependencies

We are using transifex to sync and manage the translations, please see the documentation [here](https://docs.transifex.com/api/introduction) to fill the following variables.

```bash
TRANSIFEX_URL=
TRANSIFEX_PROJECT=
TRANSIFEX_SLUG=
TRANSIFEX_API_TOKEN=
LOCALES_PATH=app/locales
```

## Analytics dependencies

In case you want to track pages visited and other user interactions get a google analytics
account [tracking id](https://support.google.com/analytics/answer/1008080?hl=en) and fill it.

```bash
GOOGLE_ANALYTICS_ID=
```



## App center integration

We are using [app center](https://appcenter.ms/apps) to handle crashes and releases.

### Crash report

[Crashes](https://docs.microsoft.com/en-us/appcenter/crashes/) is a feature integrated in the [app center react native SDK](https://docs.microsoft.com/en-us/appcenter/sdk/getting-started/react-native) that allows us to collect crashes in the app.

To start using it, it's necessary to include the following config files which contain the crash report keys for each application:

- iOS: ios/ForestWatcher/AppCenter-Config.plist

- Android: android/app/src/main/assets/appcenter-config.json


### Codepush release dependencies

[Code push](https://github.com/Microsoft/code-push) is a cloud service that lets us deploy updates directly to the user without making app store releases, thus making bug fixing much faster and effective.

Follow [this guide](https://github.com/Microsoft/react-native-code-push#getting-started) to get the necessary variables.

```bash
CODEPUSH_IOS_DEPLOY_KEY=
CODEPUSH_ANDROID_DEPLOY_KEY=
CODEPUSH_RELEASE_PUBLIC_KEY=
```
