// @flow

import RNShare from 'react-native-share';
import Config from 'react-native-config';

export default async function shareBundle(path: string): Promise<void> {
  await RNShare.open({
    saveToFiles: true,
    url: `file://${path}`,
    type: Config.SHARING_BUNDLE_MIME_TYPE,
    showAppsToView: true
  });
}
