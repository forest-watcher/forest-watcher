import React from 'react';
import Home from 'components/home';
import Dashboard from 'containers/dashboard';
import Map from 'components/map';

function Routes(props) {
  const navigationRoute = props.scene.route;

  switch (navigationRoute.section) {
    case 'home':
      return <Home />;
    case 'dashboard':
      return <Dashboard />;
    case 'map':
      return <Map />;
    default:
      return <Home />;
  }
}

Routes.propTypes = {
  scene: React.PropTypes.shape({
    route: React.PropTypes.string
  })
};

export default Routes;
