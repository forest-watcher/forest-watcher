import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  content: {
    flexDirection: 'row',
    flex: 1
  },
  list: {
    padding: 15,
    paddingTop: 0,
    flexDirection: 'row'
  },
  alerts: {
    flexDirection: 'row',
    paddingRight: 15
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  item: {
    width: 128,
    backgroundColor: '#FFFFFF',
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    margin: 7,
    marginBottom: 0,
    overflow: 'hidden',
    flexWrap: 'wrap'
  },
  image: {
    width: 128,
    height: 128
  },
  name: {
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.main
  },
  distance: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  distanceText: {
    fontSize: 17,
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    backgroundColor: 'transparent',
    padding: 8
  },
  placeholder: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 80
  },
  placeholderImage: {
    width: Theme.screen.width - 20,
    resizeMode: 'stretch'
  },
  loadingText: {
    padding: 6,
    textAlign: 'left',
    fontStyle: 'italic',
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  }
});
