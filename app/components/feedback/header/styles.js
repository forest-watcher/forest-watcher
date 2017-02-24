import {
  Platform,
  StyleSheet
} from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  container: {
    marginTop: 8,
    height: 48,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        marginTop: 24
      }
    })
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 21,
    fontWeight: '400',
    backgroundColor: 'transparent'
  },
  light: {
    color: Theme.fontColors.white
  },
  margin: {
    marginLeft: 16
  }
});
