import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  heading: {
    ...Theme.sectionHeaderText,
    marginLeft: 24,
    marginTop: 24,
    marginBottom: 12
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
  },
  rowContainer: {
    marginBottom: 18,
    height: 94 // extra 2 for bottomBorder in Row component
  }
});
