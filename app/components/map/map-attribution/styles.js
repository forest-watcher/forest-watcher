import Theme from 'config/theme';
import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  attributionContainer: {
    paddingRight: Theme.margin.right,
    flex: 1,
    alignItems: 'flex-end',
    marginBottom: 4
  },
  footerZIndex: {
    zIndex: 4
  },
  attributionText: {
    color: Theme.fontColors.white,
    backgroundColor: 'transparent'
  }
});
