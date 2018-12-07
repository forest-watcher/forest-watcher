import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    flex: 1,
    position: 'absolute'
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.background.modal
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 94,
    zIndex: 1,
    position: 'absolute'
  },
  footerBg: {
    width: Theme.screen.width,
    height: 94,
    resizeMode: 'stretch',
    position: 'absolute',
    bottom: 0,
    transform: [{ rotate: '180deg' }]
  },
  footerButton: {
    flexWrap: 'wrap'
  },
  footerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '400',
    backgroundColor: 'transparent'
  },
  undoButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.background.white,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  actionButton: {
    height: 64,
    position: 'absolute',
    left: Theme.margin.left,
    right: 8,
    top: 0,
    justifyContent: 'center'
  },
  actionButtonWithPadding: {
    left: 80
  }
});
