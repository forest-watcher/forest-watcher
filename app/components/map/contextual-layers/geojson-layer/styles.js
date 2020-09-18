// @flow
import Theme from 'config/theme';

const defaultPin = require('/assets/defaultPin.png');

export const mapboxStyles = {
  icon: {
    iconImage: defaultPin,
    iconAllowOverlap: true
  },
  geoJsonStyleSpec: {
    fillColor: ['case', ['has', 'fill'], ['get', 'fill'], Theme.colors.turtleGreen],
    fillOpacity: ['case', ['has', 'fill-opacity'], ['get', 'fill-opacity'], 0.4],
    lineColor: ['case', ['has', 'stroke'], ['get', 'stroke'], Theme.colors.turtleGreen],
    lineWidth: ['case', ['has', 'stroke-width'], ['get', 'stroke-width'], 3],
    lineOpacity: ['case', ['has', 'stroke-opacity'], ['get', 'stroke-opacity'], 0.8]
  }
};
