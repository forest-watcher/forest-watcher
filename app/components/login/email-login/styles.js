import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  input: {
    backgroundColor: Theme.colors.white,
    ...Theme.text,
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24
  },
  title: {
    ...Theme.text,
    fontSize: 16,
    marginLeft: Theme.margin.left,
    marginRight: Theme.margin.right,
    marginTop: 24,
    marginBottom: 12,
    fontFamily: Theme.font
  },
  actionButton: {
    marginVertical: 28,
    marginHorizontal: 24
  },
  linkStyle: {
    ...Theme.text,
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  passwordIcon: {
    margin: 24,
    resizeMode: 'contain'
  },
  passwordInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center'
  },
  error: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.colors.carnation,
    paddingTop: 24
  },
  hideError: {
    height: 0,
    paddingTop: 0
  },
  errorContainer: {
    marginLeft: Theme.margin.left,
    marginRight: Theme.margin.right,
    alignItems: 'flex-start'
  }
});
