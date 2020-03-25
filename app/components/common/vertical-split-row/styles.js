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
  item: {
    flexGrow: 1,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  imageContainer: {
    flexShrink: 1,
    alignItems: 'stretch',
    aspectRatio: 1,
    backgroundColor: Theme.background.modal,
    flexDirection: 'row'
  },
  image: {
    aspectRatio: 1,
    overflow: 'hidden',
    width: undefined, // Required to make `require()` image scale
    height: undefined // Required to make `require()` image scale
  },
  nameContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.veryLightPink,
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
    marginLeft: isSmallScreen ? 12 : 16
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  settingsButton: {
    alignSelf: 'flex-start',
    marginVertical: isSmallScreen ? 0 : 6,
    marginRight: 12
  },
  subtitle: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 15,
    fontWeight: '400',
    marginTop: isSmallScreen ? 0 : 2
  }
});
