// @flow
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  buttonPanel: {
    flexDirection: 'row-reverse', // See jsx comment to understand better
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingBottom: 16
  },
  buttonPanelTray: {
    height: 56
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    position: 'absolute'
  },
  footerBGContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    position: 'absolute'
  },
  infoBanner: {
    marginHorizontal: 25,
    marginBottom: 39
  },
  locationErrorBanner: {
    marginHorizontal: 25,
    marginBottom: -64 // shows as same position as infoBanner
  }
});
