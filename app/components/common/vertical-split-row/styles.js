import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  disclosureIndicator: {
    marginLeft: isSmallScreen ? 12 : 24
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
    borderBottomWidth: 1,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 128
  },
  imageContainer: {
    minWidth: 92,
    flexShrink: 1,
    alignItems: 'stretch',
    backgroundColor: Theme.background.modal,
    flexDirection: 'row'
  },
  largeImageContainer: {
    minWidth: isSmallScreen ? 104 : 128
  },
  image: {
    flex: 1,
    overflow: 'hidden',
    width: undefined, // Required to make `require()` image scale
    height: undefined // Required to make `require()` image scale
  },
  legendContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16
  },
  legendColor: {
    width: 14,
    height: 14,
    marginRight: 6
  },
  legendEntry: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12,
    fontWeight: '400',
    marginRight: 20
  },
  nameContainer: {
    flex: 1
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'baseline'
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'stretch',
    marginHorizontal: isSmallScreen ? 12 : 16
  },
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 16 : 17,
    fontWeight: '400'
  },
  settingsButton: {
    alignSelf: 'flex-start',
    marginRight: 12
  },
  largerPadding: {
    marginHorizontal: isSmallScreen ? 12 : 24
  },
  smallerVerticalPadding: {
    paddingVertical: isSmallScreen ? 8 : 16
  },
  subtitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 12 : 15,
    fontWeight: '400',
    marginTop: isSmallScreen ? 0 : 2,
    lineHeight: isSmallScreen ? 16 : 21
  },
  subtitleBottom: {
    marginTop: 0,
    marginBottom: 20
  }
});
