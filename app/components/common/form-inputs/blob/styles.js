import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  captureLabel: {
    right: 8,
    fontSize: 21,
    fontWeight: '400',
    fontFamily: Theme.font,
    textAlign: 'center',
    color: Theme.fontColors.light,
    backgroundColor: 'transparent'
  },
  preview: {
    height: 416,
    width: Theme.screen.width - 56 * 2,
    marginTop: 16,
    marginLeft: 56,
    marginRight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        marginTop: 8
      }
    })
  },
  previewImage: {
    height: 416,
    width: Theme.screen.width - 56 * 2
  },
  leftBtn: {
    width: 64,
    height: 64,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 8,
    bottom: 52,
    backgroundColor: Theme.background.gray,
    borderRadius: 32
  },
  leftBtnIcon: {
    position: 'absolute',
    top: 16,
    left: 22
  }
});
