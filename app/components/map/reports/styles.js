import Theme from 'config/theme';

const reportIcon = {
  iconRotationAlignment: 'map',
  iconAllowOverlap: true,
  iconSize: ['interpolate', ['exponential', 2], ['zoom'], 16, 0.8325, 19, 6.67],
  iconImage: ['get', 'icon'],
  iconOpacity: 0.75,
  iconOffset: [5, -5] // offset from the alert if at same position
};

export const mapboxStyles = {
  reportIcon,
  importedReportIcon: {
    ...reportIcon,
    iconOffset: [10, -10]
  },
  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleRadius: 20
  },
  clusterCount: {
    textColor: Theme.colors.white,
    textField: '{point_count}',
    textAllowOverlap: true,
    textSize: 12,
    textPitchAlignment: 'map'
  }
};
