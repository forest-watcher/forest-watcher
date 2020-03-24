import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  disclosureIndicator: {
    marginHorizontal: 24
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
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  imageContainer: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 26
  },
  contentContainer: {
    flex: 1,
    alignItems: 'stretch',
    marginLeft: 24
  },
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  settingsButton: {
    alignSelf: 'flex-start',
    marginVertical: 10,
    marginRight: 12
  },
  subtitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 15,
    fontWeight: '400',
    marginTop: 2
  }
});
