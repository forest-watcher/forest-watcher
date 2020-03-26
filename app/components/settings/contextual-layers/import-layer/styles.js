import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headingText: {
    flex: 1,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '500',
    marginVertical: 10
  },
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  }, 
  contentContainer: {
    paddingTop: 12,
    flex: 1,
  },
  error: {
    color: Theme.colors.carnation
  },
  errorContainer: {
    flex: 1,
    marginLeft: Theme.margin.left,
    marginRight: 18,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listHeader: {
    flex: 1,
    marginLeft: Theme.margin.left,
    marginRight: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  },
  picker: {
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
    overflow: 'hidden'
  },
  headerImage: {
    alignSelf: 'stretch',
    height: 164
  }
});
