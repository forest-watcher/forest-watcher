import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapSidebar from 'containers/map-sidebar';

class RightDrawer extends Component {

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  onPressClose = () => {
    this.props.navigator.toggleDrawer({
      side: 'right',
      animated: true
    });
  }

  render() {
    return <MapSidebar onPressClose={this.onPressClose} />;
  }
}

export default RightDrawer;
