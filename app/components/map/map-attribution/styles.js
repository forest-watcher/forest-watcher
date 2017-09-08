import Theme from 'config/theme';
import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  attributionContainer: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    paddingRight: Theme.margin.right,
    alignItems: 'flex-end',
    width: Theme.screen.width / 2
  },
  footerZIndex: {
    zIndex: 4
  },
  attributionText: {
    color: Theme.fontColors.white,
    backgroundColor: 'transparent'
  }
});
