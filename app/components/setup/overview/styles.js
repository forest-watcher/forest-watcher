import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  selector: {
    marginTop: 19
  },
  selectorLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: Theme.margin.left,
    ...Platform.select({
      android: {
        marginBottom: 6
      }
    })
  },
  image: {
    width: Theme.screen.width,
    height: 224
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.background.white
  },
  searchInput: {
    flex: 1,
    height: 64,
    paddingBottom: 0,
    marginLeft: Theme.margin.left,
    marginRight: Theme.icon.width,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary
  },
  buttonPos: {
    position: 'absolute',
    bottom: 50,
    left: 8,
    right: 8
  }
});
