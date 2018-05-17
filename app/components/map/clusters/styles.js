import Theme from 'config/theme';
import { DATASETS } from 'config/constants';
import { StyleSheet } from 'react-native';
import { hexToRgb } from 'helpers/utils';

export default StyleSheet.create({
  container: {
  },
  bubble: {
    borderRadius: 100,
    width: 40,
    height: 40,
    alignItems: 'center',
    backgroundColor: Theme.colors.color1
  },
  [`${DATASETS.GLAD}Color`]: {
    backgroundColor: Theme.colors.colorGlad
  },
  [`${DATASETS.VIIRS}Color`]: {
    backgroundColor: Theme.colors.colorViirs
  },
  colorRecent: {
    backgroundColor: Theme.colors.colorRecent
  },
  [`${DATASETS.GLAD}ColorAlert`]: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorGlad)}, 0.7)`
  },
  [`${DATASETS.VIIRS}ColorAlert`]: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorViirs)}, 0.7)`
  },
  colorRecentAlert: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorRecent)}, 0.7)`
  },
  number: {
    color: Theme.colors.color5,
    fontSize: 13,
    marginTop: 10
  },
  reportedColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.color1)}, 0.8)`
  }
});
