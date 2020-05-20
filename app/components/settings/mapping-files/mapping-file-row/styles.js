import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  item: {
    flexGrow: 1,
    paddingRight: isSmallScreen ? 12 : 16,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 1,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  imageContainer: {
    minWidth: 92,
    height: 92,
    flexShrink: 1,
    alignItems: 'stretch',
    backgroundColor: Theme.background.modal,
    flexDirection: 'row'
  },
  image: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    paddingVertical: isSmallScreen ? 12 : 16,
    flexGrow: 1,
    alignItems: 'stretch',
    marginLeft: isSmallScreen ? 12 : 16
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 10 : 12,
    lineHeight: 16,
    fontWeight: '400',
    paddingRight: 31
  },
  iconContainer: {
    padding: 6
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
