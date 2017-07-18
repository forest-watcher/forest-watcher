import Theme from 'config/theme';
import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  coordinateDistanceText: {
    color: Theme.fontColors.white
  },
  currentPositionContainer: {
    paddingLeft: Theme.margin.left,
    width: Theme.screen.width / 2,
    flex: 1
  },
  footerZIndex: {
    zIndex: 4
  }
});
