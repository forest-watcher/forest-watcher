import Theme from 'config/theme';
import { StyleSheet } from 'react-native';
import { hexToRgb } from 'helpers/utils';

export default StyleSheet.create({
  container: {
  },
  bubbleGlad: {
    backgroundColor: Theme.colors.colorGlad,
    borderRadius: 100,
    width: 40,
    height: 40,
    alignItems: 'center'
  },
  bubbleViirs: {
    backgroundColor: Theme.colors.colorViirs,
    borderRadius: 100,
    width: 40,
    height: 40,
    alignItems: 'center'
  },
  number: {
    color: Theme.colors.color5,
    fontSize: 13,
    marginTop: 10
  },
  markerIcon: { // TODO: refactor this to common icon
    width: 18,
    height: 18
  },
  reportedColor: {
    backgroundColor: 'green' // TODO: get the correct color
  },
  viirsColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorViirs)}, 0.5)`
  },
  gladColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorGlad)}, 0.5)`
  }
});
