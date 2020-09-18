// @flow

import i18n from 'i18next';
import { ActionSheetIOS, Platform } from 'react-native';
import DialogAndroid from 'react-native-dialogs';

export default async function displayExportReportDialog(
  showUploadButton: boolean,
  buttonHandler: (idx: number) => any
) {
  const title = i18n.t('report.export.title');
  const message = i18n.t('report.export.description');
  const options = [i18n.t('report.export.option.asSharingBundle'), i18n.t('report.export.option.asCSV')];

  if (showUploadButton) {
    options.push(i18n.t('report.upload'));
  }

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...options, i18n.t('commonText.cancel')],
        cancelButtonIndex: options.length,
        title,
        message
      },
      buttonHandler
    );
  } else if (Platform.OS === 'android') {
    const { selectedItem } = await DialogAndroid.showPicker(title, message, {
      items: options.map((item, idx) => ({ label: item, id: idx })),
      positiveText: i18n.t('commonText.cancel')
    });
    if (selectedItem) {
      buttonHandler(selectedItem.id);
    }
  }
}
