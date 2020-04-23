import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    overflow: 'hidden',
    paddingVertical: 16
  },
  textContainer: {
    alignItems: 'flex-start',
    flex: 1
  },
  title: {
    ...Theme.text,
    lineHeight: 24
  },
  subtitle: {
    ...Theme.text,
    lineHeight: 16,
    fontSize: 12
  }
});
