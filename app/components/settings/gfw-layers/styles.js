import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 12,
    flex: 1
  },
  errorTitle: {
    color: Theme.colors.coral
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 0
  },
  listHeader: {
    flex: 1,
    marginLeft: Theme.margin.left,
    marginRight: 18,
    paddingBottom: 8,
    paddingTop: 16,
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
  row: {
    paddingVertical: 12
  },
  rowLabel: {
    flexShrink: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12
  },
  searchContainer: {
    ...Theme.tableRow,
    marginTop: 12,
    paddingHorizontal: 24,
    marginBottom: 0
  },
  topContainer: {
    paddingBottom: 9
  },
  topContainerScrolled: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.veryLightPinkTwo
  },
  searchField: {
    flex: 1,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary
  }
});
