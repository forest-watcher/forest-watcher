import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  attributionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: Theme.screen.width,
    paddingLeft: 8,
    paddingRight: 8
  },
  footerZIndex: {
    zIndex: 4
  },
  attributionText: {
    flexDirection: 'row',
    color: Theme.fontColors.white,
    backgroundColor: 'transparent'
  }
});
