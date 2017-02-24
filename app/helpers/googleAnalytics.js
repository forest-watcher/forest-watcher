import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';
import Config from 'react-native-config';

const tracker = new GoogleAnalyticsTracker(Config.GOOGLE_ANALYTICS_ID);
export default tracker;
