import Theme from 'config/theme';
import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 4
  },
  coordinateDistanceText: {
    color: Theme.fontColors.white
  },
  currentPositionContainer: {
    paddingLeft: Theme.margin.left,
    width: 2 * (Theme.screen.width / 3),
    flex: 1,
    justifyContent: 'flex-end'
  },
  footerZIndex: {
    zIndex: 4
  }
});
