// @flow
import { Alert, Platform } from 'react-native';
import DialogAndroid from 'react-native-dialogs';

export default async (
  title: string,
  message: string,
  currentFileName: string,
  cancelTitle: string,
  confirmTitle: string,
  onConfirmPressed: string => void
) => {
  if (Platform.OS === 'ios') {
    Alert.prompt(
      title,
      message,
      [
        {
          text: cancelTitle,
          style: 'cancel'
        },
        {
          text: confirmTitle,
          onPress: onConfirmPressed,
          style: 'default'
        }
      ],
      'plain-text',
      currentFileName
    );
  } else {
    const result = await DialogAndroid.prompt(title, message, {
      defaultValue: currentFileName,
      allowEmptyInput: false,
      minLength: 1,
      maxLength: 64
    });

    if (result?.text) {
      onConfirmPressed(result.text);
    }
  }
};
