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
    marginBottom: 32
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
    marginVertical: 12
  },
  listContent: {
    alignItems: 'stretch',
    flexGrow: 1,
    paddingTop: 28
  },
  titleText: {
    ...Theme.text,
    fontSize: 20,
    textAlign: 'center'
  }
});
