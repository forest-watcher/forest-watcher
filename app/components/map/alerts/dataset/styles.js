import Theme from 'config/theme';

export const mapboxStyles = {
  alert: {
    iconRotationAlignment: 'map',
    iconAllowOverlap: true,
    iconSize: ['interpolate', ['exponential', 2], ['zoom'], 16, 0.8325, 19, 6.67],
    iconImage: ['get', 'icon'],
    iconOpacity: 0.75
  },
  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleRadius: 20,
    circleOpacity: 0.85,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white'
  },
  clusterCount: {
    textColor: Theme.colors.white,
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map'
  }
};
