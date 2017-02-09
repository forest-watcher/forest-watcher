import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'components/map';
import Settings from 'containers/settings';
import SetupBoundaries from 'components/setup/boundaries';

export const Routes = {
  Dashboard: { screen: Dashboard },
  Setup: { screen: Setup },
  Alerts: { screen: Alerts },
  Map: { screen: Map },
  Settings: { screen: Settings },
  SetupBoundaries: { screen: SetupBoundaries }
};

export const RoutesConfig = {
  headerMode: 'screen'
};
