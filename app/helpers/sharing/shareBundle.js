// @flow

import Config from 'react-native-config';
import shareFile from 'helpers/shareFile';

export default async function shareBundle(path: string): Promise<void> {
  await shareFile(path, Config.SHARING_BUNDLE_MIME_TYPE);
}
