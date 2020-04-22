import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  hide: {
    opacity: 0
  },
  inputContainer: {
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
    marginTop: 0
  },
  marker: {
    width: 0,
    height: 0,
    top: -20,
    left: 24,
    position: 'absolute',
    borderWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: Theme.borderColors.main
  },
  markerInner: {
    top: -6,
    left: -8,
    borderWidth: 8,
    borderBottomColor: Theme.background.main
  },
  inputLabel: {
    color: Theme.fontColors.secondary
  }
});
