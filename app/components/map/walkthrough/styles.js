import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  attribution: {
    opacity: 0 // Hide it so our button is still placed correctly but we don't show this UI
  },
  bodyText: {
    ...Theme.text,
    color: Theme.colors.white,
    fontSize: 16,
    textAlign: 'center'
  },
  buttonPanel: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
    paddingBottom: 16
  },
  container: {
    alignItems: 'stretch',
    padding: 30,
    flexGrow: 1,
    justifyContent: 'center'
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    position: 'absolute'
  },
  image: {
    marginTop: 24
  },
  navContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44
  },
  reportsAndRoutesParent: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  reportsAndRoutesContainer: {
    alignItems: 'center',
    backgroundColor: Theme.colors.turtleGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  titleText: {
    ...Theme.text,
    color: Theme.colors.white,
    fontSize: 20,
    textAlign: 'center'
  }
});
