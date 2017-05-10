import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  selector: {
    marginTop: 16
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
  scrollContainImage: {
    maxHeight: 224
  },
  image: {
    width: Theme.screen.width,
    height: 224,
    maxHeight: 224
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.background.white,
    marginBottom: 0
  },
  searchInput: {
    flex: 1,
    height: 64,
    maxHeight: 64,
    paddingBottom: 0,
    marginLeft: Theme.margin.left,
    marginRight: Theme.icon.width,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary
  },
  scrollContainButton: {
    flex: 1,
    minHeight: 64,
    height: 64,
    paddingLeft: 8,
    paddingRight: 8,
    ...Platform.select({
      ios: {
        left: 0,
        right: 0,
        bottom: 40,
        position: 'absolute'
      }
    })
  },
  buttonPos: {
    flex: 1,
    height: 64
  }
});
