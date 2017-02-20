import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';

export async function storeImage(url) {
  const cleanedUrl = url.replace('file://', '');
  const parentDirectory = RNFetchBlob.fs.dirs;
  const imagesDirectory = `${parentDirectory.DocumentDir}/images`;
  const newPath = `${imagesDirectory}/${cleanedUrl.split('/').pop()}`;

  try {
    const isDir = await RNFetchBlob.fs.isDir(imagesDirectory);

    if (!isDir) {
      await RNFetchBlob.fs.mkdir(imagesDirectory);
    }

    await RNFetchBlob.fs.mv(cleanedUrl, newPath)
      .catch((error) => {
        // To-do error
      });

    return newPath;
  } catch (error) {
    // To-do error
  }
}

export function parseImagePath(url) {
  let parsedUrl = url;

  if (Platform.OS === 'android') {
    parsedUrl = `file://${parsedUrl}`;
  }

  return parsedUrl;
}
