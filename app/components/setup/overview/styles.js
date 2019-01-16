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
    marginBottom: 0,
    paddingLeft: 16,
    paddingRight: 16
  },
  searchInput: {
    flex: 1,
    textAlignVertical: 'center',
    height: 64,
    maxHeight: 64,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 16,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary
  },
  buttonPos: {
    flex: 1,
    height: 64,
    marginTop: 16,
    marginHorizontal: 8
  }
});
