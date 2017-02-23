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
    marginTop: 16,
    marginLeft: 56,
    marginRight: 56,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
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
