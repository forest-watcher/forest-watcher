import Home from 'containers/home';
import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'components/map';
import Settings from 'containers/settings';
import Report from 'containers/report';

export const Routes = {
  Home: { screen: Home },
  Setup: { screen: Setup },
  Dashboard: { screen: Dashboard },
  Alerts: { screen: Alerts },
  Map: { screen: Map },
  Settings: { screen: Settings },
  Report: { screen: Report }
};

export const RoutesConfig = {
  initialRouteName: 'Home',
  headerMode: 'screen'
};
