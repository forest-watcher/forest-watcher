import Home from 'containers/home';
import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'components/map';
import Settings from 'containers/settings';
import Reports from 'containers/reports';
import NewReport from 'components/reports/new';

export const Routes = {
  Home: { screen: Home },
  Setup: { screen: Setup },
  Dashboard: { screen: Dashboard },
  Alerts: { screen: Alerts },
  Map: { screen: Map },
  Settings: { screen: Settings },
  Reports: { screen: Reports },
  NewReport: { screen: NewReport }
};

export const RoutesConfig = {
  initialRouteName: 'Alerts',
  headerMode: 'screen'
};
