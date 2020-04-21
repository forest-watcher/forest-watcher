// @flow

import RNShare from 'react-native-share';

export default async function shareBundle(path: string): Promise<void> {
  await RNShare.open({
    saveToFiles: true,
    url: `file://${path}`
  });
}
