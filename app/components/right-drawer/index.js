import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapSidebar from 'components/map-sidebar';

class RightDrawer extends Component {

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      dummyLayers: [
        {
          id: 1234,
          name: 'Protected Areas',
          value: false
        }
      ]
    };
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

  onLayerToggle = (id, value) => {
    const newLayer = this.state.dummyLayers.map((layer) => {
      if (layer.id === id) {
        return { ...layer, value };
      }
      return layer;
    });
    this.setState({ dummyLayers: newLayer });
  }

  render() {
    return (
      <MapSidebar
        layers={this.state.dummyLayers}
        onPressClose={this.onPressClose}
        onLayerToggle={this.onLayerToggle}
      />
    );
  }
}

export default RightDrawer;
