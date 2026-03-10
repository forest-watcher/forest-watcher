declare module 'react-native-config' {
  const Config: { [key: string]: string };
  export default Config;
}

declare module '@react-native-mapbox-gl/maps' {
  const MapboxGL: any;
  export default MapboxGL;
}

declare module '@invertase/react-native-apple-authentication' {
  export const appleAuth: any;
}

declare module '@sentry/react-native' {
  const Sentry: any;
  export = Sentry;
}

declare const __DEV__: boolean;

