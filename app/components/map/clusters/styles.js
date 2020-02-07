import Theme from 'config/theme';
import { DATASETS } from 'config/constants';
import { StyleSheet } from 'react-native';
import { hexToRgb } from 'helpers/utils';

export default StyleSheet.create({
  container: {},
  bubble: {
    borderRadius: 100,
    width: 40,
    height: 40,
    alignItems: 'center',
    backgroundColor: Theme.colors.turtleGreen
  },
  [`${DATASETS.GLAD}Color`]: {
    backgroundColor: Theme.colors.glad
  },
  [`${DATASETS.VIIRS}Color`]: {
    backgroundColor: Theme.colors.viirs
  },
  recentColor: {
    backgroundColor: Theme.colors.recent
  },
  [`${DATASETS.GLAD}ColorAlert`]: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.glad)}, 0.7)`
  },
  [`${DATASETS.VIIRS}ColorAlert`]: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.viirs)}, 0.7)`
  },
  recentColorAlert: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.recent)}, 0.7)`
  },
  number: {
    color: Theme.colors.white,
    fontSize: 13,
    marginTop: 10
  },
  reportedColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.turtleGreen)}, 0.8)`
  }
});
