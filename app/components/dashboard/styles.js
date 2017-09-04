import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  containerScroll: {
    marginBottom: 56
  },
  label: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 17,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontWeight: '400'
  },
  textMyReports: {
    fontWeight: '400',
    fontSize: 17,
    color: Theme.fontColors.secondary
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 72
  },
  row: {
    position: 'absolute',
    width: Theme.screen.width,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1
  },
  iconSettings: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});
