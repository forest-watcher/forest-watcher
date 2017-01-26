import React from 'react';
import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'components/map';

function Routes(props) {
  const navigationRoute = props.scene.route;

  switch (navigationRoute.section) {
    case 'setup':
      return <Setup />;
    case 'dashboard':
      return <Dashboard />;
    case 'alerts':
      return <Alerts />;
    case 'map':
      return <Map />;
    default:
      return <Dashboard />;
  }
}

Routes.propTypes = {
  scene: React.PropTypes.shape({
    route: React.PropTypes.string
  })
};

export default Routes;
