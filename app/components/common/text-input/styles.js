import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  inputContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    backgroundColor: Theme.background.white,
    marginTop: 8
  },
  input: {
    fontFamily: Theme.font,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
