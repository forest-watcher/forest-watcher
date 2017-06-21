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
  user: {
    height: 72,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    backgroundColor: Theme.colors.color5,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  info: {
    width: 200
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
  logout: {
    height: 24,
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
    marginRight: 10
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
  addButtonText: {
    flex: 1,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    color: Theme.fontColors.main,
    textAlign: 'center',
    marginRight: Theme.icon.width,
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
    flex: 1,
    marginTop: 30,
    textAlign: 'center',
    marginLeft: 0
  }
});
