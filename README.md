# Forest Watcher
> Delivering real-time data to frontline forest guardians.

<p align="center"><img src="screen-shot.png" height=400></p>

Android and iOS apps empowering on-the-ground monitors to respond to threats to forested areas.

Forest Watcher is part of the wider GFW technological offering, and as such also integrates with general services such as MyGFW and Resource Watch API. 

## Features

- Setup areas to monitor and view them on a map
- View GLAD and VIIRS alerts affecting your areas
- Create reports and share them with your team
- Select from pre-defined layers to provide extra context to maps
- Import and view custom layer files (GeoJSON, TopoJSON, Shapemaps, KML & KMZ, GPX, MBTiles)
- Record routes and share them with your team
- Sync data offline allowing the app to be used without an internet connection
- Share app data (areas, reports, routes, etc.) directly from app-to-app
- Help, FAQs, and clear app design to help you on your way
- Keep track of changes in the [changelog](./CHANGELOG.md)

## Getting started

### Prerequisites
- Install the latest LTS release of `node` ([instructions](https://nodejs.org/en/download/package-manager/))
- Install the most recent React Native CLI tools.
- Install the most recent version of `yarn`
- Prepare iOS environment if needed
    - Install XCode ([instructions](https://itunes.apple.com/us/app/xcode/id497799835?mt=12))
    - Install XCode CLI Tools: `xcode-select --install`
    - Install CocoaPods ([instructions](https://cocoapods.org/))
- Prepare Android environment if needed
    - Install Android SDK ([instructions])(https://developer.android.com/studio)
- Configure app
    - Supply a valid `.env` file based on `.env.sample` ([instructions](./docs/mobile/environment-vars.md))
    - Setup [Firebase](https://rnfirebase.io/) for analytics
        - Place `google-services.json` in `./android/app/`
        - Place `GoogleService-Info.plist` in `./ios/`
    - Setup [Sentry](https://github.com/getsentry/sentry-react-native) for crash reporting
        - Place `sentry.properties` in `./ios` and `./android`

### Run the app
- Run `yarn` to install dependencies and [apply local patches](./PATCHES.md)
- Run `yarn android` or `yarn ios` to run the app on a connected device / emulator

## Other information

- [API endpoints used](./docs/mobile/api.md)
- [Custom patches applied to dependencies](./PATCHES.md)
- [Changelog](./CHANGELOG.md)

## License
MIT License

Developed by Vizzuality (until July 2018, v1.6) and 3 Sided Cube (since July 2018).
