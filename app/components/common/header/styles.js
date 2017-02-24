import { StyleSheet, Platform } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        height: 114
      },
      android: {
        height: 94
      }
    })
  },
  title: {
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 0,
    ...Platform.select({
      ios: {
        paddingTop: 14
      },
      android: {
        paddingTop: 0
      }
    })
  },
  style: {
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: Theme.background.main,
    shadowRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0
  },
  titleStyle: {
    textAlign: 'left',
    fontFamily: Theme.font,
    fontSize: 21,
    fontWeight: '400',
    height: 28,
    backgroundColor: 'transparent'
  },
  center: {
    textAlign: 'center'
  },
  home: {
    fontSize: 15,
    fontWeight: '500',
    paddingTop: 4
  }
});
