import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'center'
  },
  contentContainer: {
    flexShrink: 0,
    ...Theme.modalContainer,
    alignItems: 'stretch'
  },
  description: {
    ...Theme.text,
    marginBottom: 28
  },
  fileName: {
    ...Theme.text,
    fontWeight: 'bold',
    marginBottom: 20
  },
  fileTypesDescription: {
    paddingBottom: 8,
    ...Theme.tableRowText,
    fontSize: 12
  },
  acceptedFileTypes: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderColors.main
  },
  fileTypeText: {
    paddingLeft: 4,
    paddingRight: 12,
    ...Theme.tableRowText,
    fontSize: 12
  },
  fileTypeContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    alignItems: 'center'
  },
  actionText: {
    marginTop: 20,
    ...Theme.text,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline'
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
    textAlign: 'center',
    marginBottom: 32
  }
});
