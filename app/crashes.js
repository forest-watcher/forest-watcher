import Config from 'react-native-config';
import * as Sentry from '@sentry/react-native';
import { getVersionName } from './helpers/app';

// disable stacktrace merging
export async function setupCrashLogging() {
  await Sentry.init({
    debug: __DEV__,
    dsn: Config.SENTRY_DSN,
    enabled: !__DEV__,
    enableNative: true,
    enableNativeCrashHandling: true,
    enableNativeNagger: true,
    release: getVersionName()
  });
}
