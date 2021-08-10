import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'center'
  },
  contentContainer: {
    ...Theme.modalContainer,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'stretch'
  },
  itemBodyText: {
    ...Theme.text,
    color: Theme.colors.greyishBrown,
    flexShrink: 1,
    fontSize: 12,
    opacity: 0.8
  },
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 16
  },
  itemContentContainer: {
    flex: 1
  },
  itemIcon: {
    marginRight: 18
  },
  itemTitleText: {
    ...Theme.text,
    flexShrink: 1,
    fontSize: 16
  },
  list: {
    marginBottom: 20
  },
  listContent: {
    alignItems: 'stretch',
    flexGrow: 1,
    paddingTop: 20
  },
  titleText: {
    ...Theme.text,
    fontSize: 20,
    textAlign: 'center'
  }
});
