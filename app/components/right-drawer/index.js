import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapSidebar from 'containers/map-sidebar';

class RightDrawer extends Component {

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'didAppear':
        this.onDidAppear();
        break;
      case 'didDisappear':
        this.onDidDisappear();
        break;
      default:
    }
  }

  onDidAppear = () => {
    tron.log('Im here');
  }

  onDidDisappear = () => {
    tron.log('Im out');
  }

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
