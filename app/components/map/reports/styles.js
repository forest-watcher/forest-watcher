export const mapboxStyles = {
  reportIcon: {
    iconRotationAlignment: 'map',
    iconAllowOverlap: true,
    iconSize: ['interpolate', ['exponential', 2], ['zoom'], 16, 0.8325, 19, 6.67],
    iconImage: ['get', 'icon'],
    iconOpacity: 0.75
  },
  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleRadius: 20, // this should be half the cluster radius in the styles
    circleOpacity: 0.85,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white'
  },
  clusterCount: {
    textField: '{point_count}',
    textAllowOverlap: true,
    textSize: 15,
    textPitchAlignment: 'map'
  }
};
