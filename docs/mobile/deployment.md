# Deployment 

## Stores release

Made by hand for now, [fastlane](https://fastlane.tools/) wip

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