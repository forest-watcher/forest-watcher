import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingTop: 0
  },
  label: {
    ...Theme.sectionHeaderText
  },
  list: {
    flex: 1,
    paddingTop: isSmallScreen ? 8 : 28
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 72
  },
  row: {
    position: 'absolute',
    width: Theme.screen.width,
    backgroundColor: Theme.background.white,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 16
  },
  tableRowContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tableRowText: {
    marginLeft: 24,
    ...Theme.tableRowText
  },
  tableRowSubText: {
    marginLeft: 24,
    ...Theme.tableRowText,
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4
  },
  iconSettings: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  noticeTitle: {
    color: Theme.fontColors.white,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20
  },
  noticeSubtitle: {
    color: Theme.fontColors.white,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2
  },
  noticeRow: {
    backgroundColor: '#94BE43',
    paddingVertical: 24,
    marginBottom: 0,
    marginTop: 0
  }
});
