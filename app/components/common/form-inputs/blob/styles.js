import Theme from 'config/theme';
import {
  Platform,
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 416,
    width: Theme.screen.width - (56 * 2)
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
  captureBtn: {
    width: 64,
    height: 64,
    backgroundColor: Theme.background.secondary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 52,
    marginLeft: 8
  },
  preview: {
    height: 416,
    width: Theme.screen.width - (56 * 2),
    marginTop: 48,
    marginLeft: 56,
    marginRight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        marginTop: 64
      }
    })
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
