import Theme from 'config/theme';
import MapboxGL from '@react-native-mapbox-gl/maps';
const routeDestinationMarker = require('assets/routeDestinationMarker.png');

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
  routeLineLayerSelected: {
    lineWidth: 7
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
  routeEndsInner: {
    circleRadius: 7,
    circleColor: Theme.colors.turtleGreen
  },
  routeEndsOuter: {
    circleRadius: 10,
    circleColor: Theme.colors.white
  },
  routeEndsInnerSelected: {
    circleRadius: 8,
    circleColor: Theme.colors.turtleGreen
  },
  routeEndsOuterSelected: {
    circleRadius: 12,
    circleColor: Theme.colors.white
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
    iconImage: routeDestinationMarker,
    iconAllowOverlap: true
  }
};
