import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    marginTop: 6,
    marginBottom: 0
  },
  heading: {
    fontSize: 21,
    color: Theme.fontColors.main,
    fontFamily: Theme.font
  },
  body: {
    marginTop: 40
  },
  contextualLayersContainer: {},
  contextualLayersTitle: {
    fontSize: 16,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    marginLeft: Theme.margin.left,
    marginBottom: 8
  }
});
