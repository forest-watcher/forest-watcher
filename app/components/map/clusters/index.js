import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MapView from 'react-native-maps';
import ClusterMarker from 'components/map/clusters/clusterMarker';
import {
  View
} from 'react-native';

const alertGlad = require('assets/alert-glad.png');
const alertViirs = require('assets/alert-viirs.png');

class Clusters extends PureComponent {
  selectAlert = (index) => {
    const marker = this.props.markers[index];
    this.props.selectAlert({
      latitude: marker.geometry.coordinates[1],
      longitude: marker.geometry.coordinates[0]
    });
  }

  render() {
    if (!this.props.markers) return null;
    return (
      <View>
        {this.props.markers.map((marker, index) => (
          marker.properties.point_count !== undefined ? (
            <ClusterMarker key={index} marker={marker} zoomTo={this.props.zoomTo} datasetSlug={this.props.datasetSlug} />
          ) : (
            <MapView.Marker
              key={index}
              coordinate={{
                latitude: marker.geometry.coordinates[1],
                longitude: marker.geometry.coordinates[0]
              }}
              image={this.props.datasetSlug === 'viirs' ? alertViirs : alertGlad}
              onPress={() => this.selectAlert(index)}
              zIndex={1}
              draggable={false}
              anchor={{ x: 0.5, y: 0.5 }}
            />
          )
        ))}
      </View>
    );
  }
}

Clusters.propTypes = {
  markers: PropTypes.array.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  selectAlert: PropTypes.func.isRequired,
  zoomTo: PropTypes.func.isRequired
};

export default Clusters;
