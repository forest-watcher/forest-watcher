# Running the application

### Easy way
Open simulators and
```npm start```

### Troubleshoot
- When compiling the native dependencies, you may need to reset the build cache. Just run `npm start -- --reset-cache`.

- Failed to start daemon error
```bash
error: could not install *smartsocket* listener: Address already in use ADB server didn't ACK * failed to start daemon *
```
https://github.com/facebook/react-native/issues/8401#issuecomment-344628512

#### iOS Environment

1. Open XCode
2. File > Open > ios/ForestWatcher.xcworkspace
3. Run

#### Android Environment

1. Open Android Studio
2. Select `Open an existing Android Studio Project` choose `/android` folder.
5. Create and fill `.env` file. ([See Environment Variables](/mobile/environment-vars.md))
4. Run
5. Install SDK platform, Build Tools and sync projects as asked.
6. If you haven't already generated a signing key/keystore do it now. ([How to generate a keystore](/mobile/environment-vars.md#application-signing))
7. Run again

#### React Debugger

1. Install react debugger: https://github.com/jhen0409/react-native-debugger
2. Launch it from within the simulator and select Debug JS Remotely

#### Transifex API scripts

1. To push the source file (EN): `npm run transifex:push`
2. To pull translation files (ES, FR, ID, PT): `npm run transifex:pull`