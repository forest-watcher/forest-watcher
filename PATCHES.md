# Patches

Description of patches created with the `patch-package` library.

| Library Name (asc)             | Version | Date     | Patch Description                                                                          |
| ------------------------------ | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `react-native-navigation`      | v6.1.2  | 21/05/20 | iOS: Adds fixes for dismissModal animation causing black screen of death!                  |
| `@react-native-mapbox-gl/maps` | v8.0.0  | 30/05/20 | iOS: Ensured that the library will request Always, as that is required for route tracking. |
| `react-native-fs`              | v2.16.6  | 16/06/20 | Android: Ensure all API methods assume URI parameters are not percent-encoded consistently |                           
| `react-native-share`           | v3.3.2  | 13/05/20 | Android: Prevent MIME type being lost                                                      |
| `react-native-zip-archive`     | v5.0.2  | 13/05/20 | Android: Upgrade zip4j and add support for content:// URIs                                 |
| `rn-fetch-blob`                | v0.12.0 | 06/07/20 | Android: Fix `readStream` not always working with content:// URIs and fix crash in RNFB (https://github.com/joltup/rn-fetch-blob/issues/490)            |
