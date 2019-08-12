# Fastlane

**IMPORTANT NOTE:** This information is deprecated - an alternative CI system is now in place for deployment & release management.

We are using [fastlane](https://fastlane.tools/) to automate the development and release process and we need some previous steps to get it ready first.

## Android

1. Generate the `Google_Play_Android_Developer.json` file following [this instructions](https://docs.fastlane.tools/getting-started/android/setup/#collect-your-google-credentials)
2. Copy to the root /private folder

## iOS

1. Go to /ios folder
2. Create a .env file with the following params:

```bash
APPLE_ID= # Your Apple email address
ITC_TEAM_ID= # iTunes Connect Team ID
TEAM_ID= # Developer Portal Team ID
```
