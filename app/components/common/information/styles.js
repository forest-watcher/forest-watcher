import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  bodyText: {
    ...Theme.text,
    opacity: 0.6,
    fontSize: 12
  },
  closeIcon: {
    alignSelf: 'flex-end',
    marginRight: 12
  },
  closeIconTouchable: {
    alignSelf: 'flex-end',
    paddingVertical: 32
  },
  container: {
    alignItems: 'stretch',
    padding: 24,
    justifyContent: 'center',
    flex: 1
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 24,
    flexShrink: 1
  },
  titleText: {
    ...Theme.text,
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center'
  }
});
