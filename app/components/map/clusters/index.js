import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import ClusterMarker from 'components/map/clusters/clusterMarker';
import {
  View
} from 'react-native';

const alertGlad = require('assets/alert-glad.png');
const alertViirs = require('assets/alert-viirs.png');

class Clusters extends PureComponent {
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
              onPress={this.props.selectAlert}
              zIndex={1}
              draggable={false}
              anchor={{ x: 0.5, y: 0.5 }}
              pointerEvents={'none'}
            />
          )
        ))}
      </View>
    );
  }
}

Clusters.propTypes = {
  markers: React.PropTypes.array.isRequired,
  datasetSlug: React.PropTypes.string.isRequired,
  selectAlert: React.PropTypes.func.isRequired,
  zoomTo: React.PropTypes.func.isRequired
};

export default Clusters;
