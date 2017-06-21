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
  captureBtnDisabled: {
    backgroundColor: Theme.background.gray
  },
  preview: {
    height: 416,
    width: Theme.screen.width - (56 * 2),
    marginTop: 16,
    marginLeft: 56,
    marginRight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        marginTop: 32
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
  },
  savingContainer: {
    width: Theme.screen.width,
    height: 160,
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
