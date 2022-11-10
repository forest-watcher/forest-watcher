import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  selector: {
    marginTop: 16
  },
  selectorLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: Theme.margin.left,
    ...Platform.select({
      android: {
        marginBottom: 6
      }
    })
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.background.white,
    marginBottom: 0,
    paddingLeft: 16,
    paddingRight: 16
  },
  searchInput: {
    flex: 1,
    textAlignVertical: 'center',
    height: 64,
    maxHeight: 64,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 16,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary
  },
  buttonPos: {
    flex: 1,
    height: 64,
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 8
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.background.main,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  mapView: {
    overflow: 'hidden'
  },
  mapbox: {
    width: Theme.screen.width,
    height: 224,
    maxHeight: 224
  }
});

export const mapboxStyles = {
  circleOverlayStyle: {
    fillColor: Theme.colors.turtleGreen,
    fillOpacity: 0.2
  },
  circleOutlineStyle: {
    lineColor: Theme.colors.turtleGreen,
    lineCap: MapboxGL.LineJoin.Round,
    lineJoin: MapboxGL.LineJoin.Round,
    lineWidth: 3,
    lineOpacity: 0.8
  }
};
