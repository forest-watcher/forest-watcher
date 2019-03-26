import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    position: 'relative'
  },
  containerEmpty: {
    flex: 1,
    backgroundColor: Theme.background.main,
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerFloat: {
    marginTop: 56
  },
  containerFull: {
    marginTop: 0
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
  emptyTitle: {
    flex: 1,
    fontSize: 17,
    marginTop: 48,
    marginLeft: Theme.margin.left,
    marginRight: Theme.margin.left,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  },

  exportButton: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10
  },
  exportButtonContainer: {
    backgroundColor: 'white',

    borderTopWidth: 5,
    height: 75
  },
  exportTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    paddingVertical: 20,
    color: Theme.fontColors.light,
    alignSelf: 'center',
    alignContent: 'center'
  },
  listItem: {
    maxWidth: 288
  },
  itemTitle: {
    paddingTop: 1,
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
