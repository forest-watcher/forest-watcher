import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingTop: 10
  },
  containerContent: {
    paddingBottom: 20
  },
  content: {
    paddingTop: 0,
    paddingBottom: 30
  },
  area: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15
  },
  areaMore: {
    fontSize: 18,
    color: '#CCCCCC'
  },
  list: {
    padding: 10,
    flexDirection: 'row'
  },
  alerts: {
    flexDirection: 'row',
    paddingRight: 20
  },
  alertItem: {
    width: 150,
    height: 180,
    backgroundColor: '#FFFFFF',
    shadowRadius: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 0
    },
    margin: 7,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#434343'
  }
});
