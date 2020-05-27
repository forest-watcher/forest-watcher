// @flow
import { Alert } from 'react-native';

export default (
  title: string,
  message: string,
  cancelTitle: string,
  deleteTitle: string,
  onDeletePress: () => void
) => {
  Alert.alert(title, message, [
    {
      text: cancelTitle,
      style: 'cancel'
    },
    {
      text: deleteTitle,
      style: 'destructive',
      onPress: onDeletePress
    }
  ]);
};
