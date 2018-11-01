# Deployment

## Stores release

Fastlane saves us a lot of time automating processes, please take a look first on the [fastlane variables doc](/mobile/environment-vars/fastlane-variables.md).

And remember to install it.

```bash
gem install fastlane -NV
````

To deploy a beta version for the testers just run:

```bash
cd /android | /ios
fastlane beta
```

To deploy to the stores:

1. Update the changelogs:

**Android**
open /android/metadata/android/[language]/[build-number].txt

**iOS**
open /ios/metadata/[language]/[release_notes].txt

2. Update the screenshots
Use the [template](https://github.com/jtholloran/shots) to generate yours and move to `/screenshots` folder

**Android**
run fastlane supply

**iOS**
run fastlane deliver

3. Save them and run

```bash
cd /android | /ios
fastlane deploy
```

4. For iOS you will need to run the publish command skipping the screnshots as we don't have all of them ready yet
```bash
fastlane deliver --skip_screenshots
```


## Code push release

1. Make sure you get the private keys from the `/private` folder and the .env variables filled in.

2. Run `npx code-push login` and follow the instructions to log into App Center.

3. Run the publishing command:

For android

```
npx code-push release-react ForestWatcher-Android android -m --description "Your msg code" --privateKeyPath private/codepushkey.pem
```

For iOS

```
npx code-push release-react ForestWatcher-iOS ios -m --description "Your msg code" --privateKeyPath private/codepushkey.pem
```