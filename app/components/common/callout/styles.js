import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export const arrowWidth = 8;

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Theme.colors.turtleGreen,
    borderColor: 'rgba(85,85,85,0.1)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12
  },
  shadow: {
    shadowRadius: 4,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 }
  },
  titleText: {
    ...Theme.text,
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  },
  bodyText: {
    ...Theme.text,
    color: 'white',
    fontSize: 16,
    textAlign: 'center'
  }
});
