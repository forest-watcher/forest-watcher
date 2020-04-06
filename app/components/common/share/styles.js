import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  buttonText: {
    ...Theme.tableRowText,
    color: Theme.colors.turtleGreen
  },
  container: {
    flexGrow: 1
  },
  header: {
    borderTopColor: Theme.colors.veryLightPinkTwo,
    borderTopWidth: 1,
    marginBottom: 0,
    marginTop: 24
  },
  headerContent: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  rowText: {
    ...Theme.tableRowText
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
