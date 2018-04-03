# Environment variables
In order to get your application running you'll need to setup some environment variables.

You might not want to use all env variables, it's really important that you define all of them and leave empty the ones you don't need.

The following env vars are directly related to the app behaviour.

For the rest of the env vars go to:
- [OAuth variables](/mobile/environment-vars/oauth-variables.md)
- [Fastlane variables](/mobile/environment-vars/fastlane-variables.md)
- [Other third party variables](/mobile/environment-vars/other-third-party-variables.md)

## Application dependencies

Basic dependencies from the [RW API](https://resource-watch.github.io/doc-api/index-rw.html) and the values from some datasets.

```bash
API_URL=https://production-api.globalforestwatch.org/v1
DATASET_COUNTRIES=134caa0a-21f7-451d-a7fe-30db31a424aa
DATASET_GLAD=e663eb09-04de-4f39-b871-35c6c2ed10b5
DATASET_VIIRS=20cc5eca-8c63-4c41-8e8e-134dcf1e6d76
TABLE_VIIRS=vnp14imgtdl_nrt_global_7d
REPORT_ID=597b0f55856351000b087c9c
```

## Application signing
In order to run the app on Android you'll need to generate a signing key and a keystore.
After generating it, you need to save it in the `/android/app` folder and add the following env vars with **your** info.

```bash
RELEASE_STORE_FILE=
RELEASE_KEY_ALIAS=
RELEASE_STORE_PASSWORD=
RELEASE_KEY_PASSWORD=
```

Read more about key/keystore generation [here](https://developer.android.com/studio/publish/app-signing.html#generate-key).

