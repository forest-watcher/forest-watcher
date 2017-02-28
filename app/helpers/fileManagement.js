import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';

global.Buffer = global.Buffer || require('buffer').Buffer;

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str).toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString();
  };
}

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
      .catch((error) => error);

    return newPath;
  } catch (error) {
    // To-do error
    return error;
  }
}

export function parseImagePath(url) {
  let parsedUrl = url;

  if (Platform.OS === 'android') {
    parsedUrl = `file://${parsedUrl}`;
  }

  return parsedUrl;
}

export async function getCachedImageByUrl(url, imageDir) {
  const parsedUrl = url.replace(/ /g, '%20');
  const parentDirectory = RNFetchBlob.fs.dirs;
  const imagesDirectory = `${parentDirectory.DocumentDir}/${imageDir}`;
  const filePath = `${imagesDirectory}/${btoa(parsedUrl)}.${url.split('.').pop()}`;

  try {
    const isDir = await RNFetchBlob.fs.isDir(imagesDirectory);

    if (!isDir) {
      try {
        await RNFetchBlob.fs.mkdir(imagesDirectory);
      } catch (error) {
        return parseImagePath(filePath);
      }
    }

    const exists = await RNFetchBlob.fs.exists(filePath);

    if (!exists) {
      try {
        const image = await RNFetchBlob
          .config({ path: filePath })
          .fetch('GET', parsedUrl);
        return parseImagePath(image.path());
      } catch (error) {
        return error;
      }
    } else {
      return parseImagePath(filePath);
    }
  } catch (error) {
    return error;
  }
}
