import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 30
  },
  label: {
    ...Theme.sectionHeaderText
  },
  user: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  info: {
    width: '66%'
  },
  name: {
    height: 22,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  email: {
    height: 24,
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    fontStyle: 'italic'
  },
  completeProfile: {
    width: 180,
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    fontStyle: 'italic'
  },
  logout: {
    height: 24,
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
    marginRight: 10
  },
  offlineMode: {
    width: Theme.screen.width,
    marginTop: 30
  },
  areas: {
    marginTop: 30
  },
  addButton: {
    height: 64,
    borderWidth: 2,
    borderColor: Theme.borderColors.secondary,
    borderStyle: 'dashed',
    marginTop: 10,
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  addButtonIcon: {
    marginLeft: 8
  },
  addButtonText: {
    flex: 1,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    color: Theme.fontColors.main,
    textAlign: 'center',
    marginRight: Theme.icon.width + 8,
    marginTop: 2
  },
  datesSection: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.background.white,
    paddingLeft: Theme.margin.left
  },
  dateContainerLabel: {
    width: 120,
    height: 22,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  dateLabel: {
    paddingTop: 10,
    alignItems: 'flex-end'
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  dateText: {
    alignItems: 'center',
    justifyContent: 'center',
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 13,
    paddingLeft: 2,
    fontWeight: '800'
  },
  aboutSection: {
    marginTop: 30
  },
  aboutList: {
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2
  },
  aboutListItem: {
    height: 64,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Theme.margin.left,
    paddingRight: 8,
    justifyContent: 'space-between'
  },
  aboutListItemBorder: {
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 1
  },
  aboutListItemText: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    marginTop: 4
  },
  footerText: {
    marginTop: 30,
    alignItems: 'center',
    marginLeft: 0
  },
  versionText: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 14
  }
});
