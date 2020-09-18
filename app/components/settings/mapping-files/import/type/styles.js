import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  actionText: {
    ...Theme.text,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  faqContainer: {
    marginVertical: 16
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 16 : 17,
    fontWeight: '400'
  },
  description: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 8,
    ...Theme.tableRowText,
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.borderColors.main
  },
  fileTypeText: {
    paddingLeft: 4,
    paddingRight: 12,
    ...Theme.tableRowText,
    fontSize: 12
  },
  fileTypeContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    alignItems: 'center'
  },
  acceptedFileTypes: {
    flexWrap: 'wrap',
    flex: 1,
    flexDirection: 'row'
  },
  row: {
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 20 : 40
  },
  rowWithDescription: {
    paddingLeft: isSmallScreen ? 20 : 24,
    paddingTop: isSmallScreen ? 20 : 40,
    paddingBottom: isSmallScreen ? 20 : 24,
    paddingRight: 0
  },
  titleContainer: {
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    paddingBottom: 40
  },
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 12,
    flex: 1
  },
  verticalSeparator: {
    backgroundColor: Theme.colors.veryLightPink,
    height: 1,
    marginRight: -30
  }
});
