# Installing dependencies

- Node.js [How to install](https://nodejs.org/en/download/package-manager/)
- Watchman [How to install](https://facebook.github.io/watchman/docs/install.html)

- The React Native CLI:
```bash
npm install -g react-native-cli
```
- Project dependencies
```bash
npm install
```
**iOS only**
- Homebrew [How to install](http://brew.sh/)

Instead of entering all of the installation commands yourself, you're able to run a magic quick-start script that'll:
- Purge any existing dependencies to ensure a clean start.
- Run `yarn`
- Run the iOS-specific postinstall script to fix Xcode 10 linking issues.
- Run `pod install`

To run it, go to the project root in Terminal and enter `bash iOSQuickStart.sh`.

From there, you'll have a clean and (if there were no issues) ready-to-build project! Boot up the .xcworkspace file and hit run!
