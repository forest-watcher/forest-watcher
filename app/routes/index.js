import React from 'react';
import Home from '../components/home';

export default function renderScene(props) {
  const navigationRoute = props.scene.route;

  switch (navigationRoute.section) {
    default:
      return <Home />;
  }
}
