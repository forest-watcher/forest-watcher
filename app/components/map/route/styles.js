import Theme from 'config/theme';
import MapboxGL from '@react-native-mapbox-gl/maps';
const markerImage = require('assets/plus.png');

export const mapboxStyles = {
  visible: {
    visibility: 'visible'
  },
  invisible: {
    visibility: 'none'
  },
  routeLineLayer: {
    lineColor: Theme.colors.white,
    lineCap: MapboxGL.LineJoin.Round,
    lineJoin: MapboxGL.LineJoin.Round,
    lineWidth: 4
  },
  routeLineShadow: {
    lineColor: Theme.colors.black,
    lineCap: MapboxGL.LineJoin.Round,
    lineJoin: MapboxGL.LineJoin.Round,
    lineOpacity: 0.6,
    lineWidth: 20,
    lineBlur: 40
  },
  routeOuterCircle: {
    circleRadius: 7,
    circleColor: Theme.colors.white
  },
  routeInnerCircle: {
    circleRadius: 5,
    circleColor: Theme.colors.blue
  },
  routeStartOuter: {
    circleRadius: 13,
    circleColor: Theme.colors.white
  },
  routeStartInner: {
    circleRadius: 8,
    circleColor: Theme.colors.turtleGreen
  },
  routeEndOuter: {
    circleRadius: 13,
    circleColor: Theme.colors.white
  },
  routeEndInner: {
    circleRadius: 8,
    circleColor: Theme.colors.turtleGreen
  },
  routeEndsShadow: {
    circleRadius: 20,
    circleBlur: 1,
    circleColor: Theme.colors.black,
    circleOpacity: 0.6
  },
  destinationLine: {
    lineColor: Theme.colors.lightBlue,
    lineWidth: 3,
    lineOpacity: 0.8
  },
  routeDestinationMarker: {
    iconImage: markerImage,
    iconAllowOverlap: true
  }
};
