import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapSidebar from 'containers/map-sidebar';
import Timer from 'react-native-timer';

class RightDrawer extends Component {

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    setShowLegend: PropTypes.func.isRequired
  };

  componentWillUnmount() {
    Timer.clearTimeout(this, 'setShowLegend');
  }

  onPressClose = () => {
    this.props.navigator.toggleDrawer({
      side: 'right',
      animated: true
    });
    Timer.setTimeout(this, 'setShowLegend', () => this.props.setShowLegend(true), 1000);
  }

  render() {
    return <MapSidebar onPressClose={this.onPressClose} areaId={this.props.areaId} />;
  }
}

export default RightDrawer;
