import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: 104,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    flex: 1,
    justifyContent: 'space-between'
  },
  arrowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontFamily: Theme.font,
    fontSize: 21,
    fontWeight: '400'
  },
  margin: {
    marginLeft: 16
  },
  layerIcon: {
    marginRight: 16
  }
});
