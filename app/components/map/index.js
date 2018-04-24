import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import Config from 'react-native-config';
import { Button, View, Text } from 'react-native';
// import { MAPS } from 'config/constants';
import styles from './styles';

const token = Config.MAPBOX_TOKEN;

MapboxGL.setAccessToken(token);

const basemapStyleURL = MapboxGL.StyleURL.SatelliteStreet;
const styleURL = 'https://gist.githubusercontent.com/j8seangel/93cf4b8783b145a704d7a262de5a3cf0/raw/dfb74fac47c05f5b30c4840e11619a4d5e6c5731/mapbox.js';

class Map extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.map = null;
    this.state = {
      mapPress: {},
      progress: '',
      zoom: 0
    };
  }

  deleteBasemap = async () => {
    const { id, name } = this.props.area;
    const pack = `basemap-${name}-${id}`;
    await MapboxGL.offlineManager.deletePack(pack);
    this.setState({
      progress: 'DELETED'
    });
  }

  componentWillUnmount() {
    const { id, name } = this.props.area;
    const pack = `basemap-${name}-${id}`;
    MapboxGL.offlineManager.unsubscribe(pack);
  }

  onDownloadProgress = (offlineRegion, offlineRegionStatus) => {
    this.setState({
      progress: JSON.stringify(offlineRegionStatus)
    });
  }

  onError = (error, offline) => {
    // tron.log('error and offline')
    // tron.log(error)
    // tron.log(offline)
    this.setState({
      progress: JSON.stringify(offline)
    });
  }

  onRegionDidChange = async () => {
    const zoom = await this.map.getZoom();
    this.setState({ zoom });
  }

  cacheBasemap = async () => {
    const { id, name, bbox } = this.props.area;
    const pack = `basemap-${name}-${id}`;
    const bounds = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];

    const options = {
      name: pack,
      bounds,
      styleURL: basemapStyleURL,
      minZoom: 2,
      maxZoom: 10
    };

    // start download
    const offlinePack = await MapboxGL.offlineManager.getPack(pack);
    if (offlinePack) {
      const status = await offlinePack.status();
      this.setState({
        progress: JSON.stringify(status)
      });
      if (status.state !== MapboxGL.OfflinePackDownloadState.Complete) {
        this.setState({
          progress: 'RESUMING DOWNLOAD'
        });
        MapboxGL.offlineManager.subscribe(pack, this.onDownloadProgress, this.onError);
        offlinePack.resume(pack);
      }
    } else {
      this.setState({
        progress: 'DOWNLOADING AREA'
      });
      MapboxGL.offlineManager.createPack(options, this.onDownloadProgress, this.onError);
    }
  }

  onMapPress = (e) => {
    this.setState({
      mapPress: e
    });
  }

  render() {
    const { center } = this.props;
    return (
      <React.Fragment>
        <MapboxGL.MapView
          animated
          zoomLevel={5}
          compassEnabled
          showUserLocation
          attributionEnabled
          pitchEnabled={false}
          rotateEnabled={false}
          style={styles.container}
          onPress={this.onMapPress}
          ref={(m) => (this.map = m)}
          onRegionDidChange={this.onRegionDidChange}
          centerCoordinate={[center.lat, center.lon]}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
        >
          {/* <MapboxGL.RasterSource
            id="stamenWatercolorSource"
            url="https://wri-01.carto.com/api/v1/map/named/forest_watcher_ctx_layers_nm/3/{z}/{x}/{y}.png"
            tileSize={256}
          >
            <MapboxGL.RasterLayer
              id="stamenWatercolorLayer"
              sourceID="stamenWatercolorSource"
              style={{ rasterOpacity: 1 }}
            />
          </MapboxGL.RasterSource> */}
          <MapboxGL.RasterSource
            id="rasterSource"
            url={styleURL}
            tileSize={256}
          >
            <MapboxGL.RasterLayer
              sourceID="rasterSource"
              id="rasterLayer"
            />
          </MapboxGL.RasterSource>
        </MapboxGL.MapView>
        <View pointerEvents="box-none" style={styles.footer}>
          <Text>
            Zoom: {this.state.zoom}
          </Text>
          <Text>
            Progress: {this.state.progress}
          </Text>
          <Text>
            Map pressed: {JSON.stringify(this.state.mapPress)}
          </Text>
          <Button title="Cache basemap" onPress={this.cacheBasemap} />
          <Button title="Delete basemap" onPress={this.deleteBasemap} />
        </View>
      </React.Fragment>
    );
  }
}

export default Map;
