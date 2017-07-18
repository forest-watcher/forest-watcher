import Theme from 'config/theme';
import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  map: {
    flex: 1
  },
  coordinateDistanceText: {
    color: Theme.fontColors.white
  },
  currentPositionContainer: {
    paddingLeft: Theme.margin.left,
    width: Theme.screen.width,
    flex: 1
  },
  footerZIndex: {
    zIndex: 4
  }
});
