import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'components/map';
import Settings from 'containers/settings';
import Report from 'containers/report';

export const Routes = {
  Setup: { screen: Setup },
  Dashboard: { screen: Dashboard },
  Alerts: { screen: Alerts },
  Map: { screen: Map },
  Settings: { screen: Settings },
  Report: { screen: Report }
};

export const RoutesConfig = {
  headerMode: 'screen'
};
