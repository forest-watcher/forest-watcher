import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  disclosureIndicator: {
    marginHorizontal: isSmallScreen ? 12 : 24
  },
  downloadButton: {
    bottom: 12,
    left: 12,
    position: 'absolute'
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.veryLightPink
  },
  item: {
    flexGrow: 1,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  imageContainer: {
    minWidth: isSmallScreen ? 104 : 128,
    flexShrink: 1,
    alignItems: 'stretch',
    backgroundColor: Theme.background.modal,
    flexDirection: 'row'
  },
  image: {
    flex: 1,
    overflow: 'hidden',
    width: undefined, // Required to make `require()` image scale
    height: undefined // Required to make `require()` image scale
  },
  nameContainer: {
    flex: 1,
    paddingVertical: isSmallScreen ? 12 : 24
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'stretch',
    marginLeft: isSmallScreen ? 12 : 16 // todo mpf: sometimes margin needs to be 24
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 16 : 17,
    fontWeight: '400'
  },
  settingsButton: {
    alignSelf: 'flex-start',
    marginVertical: isSmallScreen ? 0 : 6,
    marginRight: 12
  },
  smallerVerticalPadding: {
    paddingVertical: isSmallScreen ? 8 : 16
  },
  subtitle: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 12 : 15,
    fontWeight: '400',
    marginTop: isSmallScreen ? 0 : 2
  }
});
