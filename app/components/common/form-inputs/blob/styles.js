import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Theme.screen.height,
    width: Theme.screen.width
  },
  captureLabel: {
    position: 'absolute',
    top: 45,
    left: 8,
    right: 8,
    fontSize: 21,
    fontWeight: '400',
    fontFamily: Theme.font,
    textAlign: 'center',
    color: Theme.fontColors.white
  },
  captureBtn: {
    width: 64,
    height: 64,
    backgroundColor: Theme.background.secondary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 52
  },
  preview: {
    marginTop: 8,
    marginLeft: 56,
    marginRight: 56
  },
  previewImage: {
    height: 416,
    width: Theme.screen.width - (56 * 2)
  },
  leftBtn: {
    width: 64,
    height: 64,
    position: 'absolute',
    left: 8,
    bottom: 52,
    backgroundColor: Theme.background.gray,
    borderRadius: 32
  },
  leftBtnIcon: {
    position: 'absolute',
    top: 6,
    left: 12
  }
});
