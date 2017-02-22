import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: Theme.background.main
  },
  listContainer: {
    flex: 1,
    marginBottom: 24
  },
  listHeader: {
    flex: 1,
    marginLeft: Theme.margin.left,
    marginRight: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  },
  listAction: {
    fontSize: 15,
    fontWeight: '500',
    color: Theme.fontColors.main,
    opacity: 0 // TODO: show it once the features are ready
  },
  listItem: {
    flex: 1,
    minHeight: 64,
    maxHeight: 120,
    padding: 16,
    paddingLeft: Theme.margin.left,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderColors.main
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  itemTitle: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary
  },
  itemText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  }
});
