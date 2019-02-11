import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 4
  },
  coordinateDistanceText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 17,
    fontWeight: '500'
  },
  currentPositionContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  footerZIndex: {
    zIndex: 4
  }
});
