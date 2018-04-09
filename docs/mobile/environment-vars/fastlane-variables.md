# Fastlane

We are using [fastlane](https://fastlane.tools/) to automate the development and release process and we need some previous steps to get it ready first.

From the large community of plugins we are using the [appcenter integration](https://github.com/Microsoft/fastlane-plugin-appcenter) so we can upload the beta builds to test internally first.

## Android

1. Generate the `Google_Play_Android_Developer.json` file following [this instructions](https://docs.fastlane.tools/getting-started/android/setup/#collect-your-google-credentials)
2. Copy to the root /private folder
3. Go to /android folder
4. Create a .env file with the following params:

```bash
APPCENTER_API_TOKEN=
APPCENTER_OWNER_NAME=
```

5. Fill them with the values from [here](https://appcenter.ms/settings/apitokens)

## iOS

1. Go to /ios folder
2. Create a .env file with the following params:

```bash
APPLE_ID= # Your Apple email address
ITC_TEAM_ID= # iTunes Connect Team ID
TEAM_ID= # Developer Portal Team ID

APPCENTER_API_TOKEN=
APPCENTER_OWNER_NAME=
```
