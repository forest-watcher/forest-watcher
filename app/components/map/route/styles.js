import Theme from 'config/theme';
import MapboxGL from "@react-native-mapbox-gl/maps";

export const mapboxStyles = {
  routeLineLayer: {
    lineColor: Theme.colors.white,
    lineCap: MapboxGL.LineJoin.Round,
    lineJoin: MapboxGL.LineJoin.Round,
    lineWidth: 4
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
  }
};
