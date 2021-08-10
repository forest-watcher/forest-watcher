import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  buttonContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#80b51f',
    paddingLeft: 10 // Needed to override `noIcon` on button setting paddingLeft to `0`
  },
  buttonText: {
    flexGrow: 0
  },
  actionContainer: {
    borderTopColor: Theme.colors.veryLightPink,
    borderTopWidth: 1,
    marginLeft: 16,
    paddingBottom: 16,
    paddingRight: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 10, // To account for borders being external on Android
    alignItems: 'flex-start'
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderColor: Theme.colors.veryLightPink,
    borderWidth: 2,
    flex: 1
  },
  textContainer: {
    alignItems: 'flex-start',
    flex: 1
  },
  title: {
    ...Theme.text,
    lineHeight: 24
  },
  topContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    overflow: 'hidden',
    paddingVertical: 16
  },
  subtitle: {
    ...Theme.text,
    lineHeight: 16,
    fontSize: 12
  }
});
