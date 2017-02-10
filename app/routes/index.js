import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'components/map';

export const Routes = {
  Dashboard: { screen: Dashboard },
  Setup: { screen: Setup },
  Alerts: { screen: Alerts },
  Map: { screen: Map }
};

export const RoutesConfig = {
  initialRouteName: 'Setup',
  headerMode: 'screen'
};
