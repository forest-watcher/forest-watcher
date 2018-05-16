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
  reportedColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.color1)}, 0.8)`
  },
  viirsColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorViirs)}, 0.7)`
  },
  gladColor: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorGlad)}, 0.7)`
  }
});
