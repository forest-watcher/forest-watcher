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

import RNFetchBlob from 'react-native-fetch-blob';

export async function storeImage(url) {
  const parentDirectory = RNFetchBlob.fs.dirs;
  const imagesDir = `${parentDirectory.DocumentDir}/images/`;
  const newPath = `${parentDirectory.DocumentDir}/images/${url.split('/').pop()}`;

  try {
    await RNFetchBlob.fs.isDir(imagesDir)
    .then(async (isDir) => {
      if (!isDir) {
        RNFetchBlob.fs.mkdir(imagesDir)
        .catch(() => {
          // To-do error
        });
      }
    });

    await RNFetchBlob.fs.mv(url, newPath)
      .catch((error) => {
        // To-do error
      });

    return newPath;
  } catch (error) {
    // To-do error
  }
}

export async function getCachedImageByUrl(url, imageDir) {
  const parsedUrl = url.replace(/ /g, '%20');
  const parentDirectory = RNFetchBlob.fs.dirs;
  const imagesDirectory = `${parentDirectory.DocumentDir}/${imageDir}`;
  const filePath = `${imagesDirectory}/${btoa(parsedUrl)}.${url.split('.').pop()}`;

  try {
    const isDir = await RNFetchBlob.fs.isDir(imagesDirectory);

    if (!isDir) {
      await RNFetchBlob.fs.mkdir(imagesDirectory);
    }

    const exists = await RNFetchBlob.fs.exists(filePath);

    if (!exists) {
      await RNFetchBlob
        .config({
          path: filePath
        })
        .fetch('GET', parsedUrl);
    }

    return filePath;
  } catch (error) {
    // To-do
  }
}
