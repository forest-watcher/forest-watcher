import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import CONSTANTS from 'config/constants';

global.Buffer = global.Buffer || require('buffer').Buffer; // eslint-disable-line

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

export function parseImagePath(url) {
  let parsedUrl = url;

  if (Platform.OS === 'android') {
    parsedUrl = `file://${parsedUrl}`;
  }

  return parsedUrl;
}

export async function storeImage(url, imageDir = false) {
  const cleanedUrl = url.replace('file://', '');
  const parentDirectory = RNFetchBlob.fs.dirs;
  let imagesDirectory = `${parentDirectory.DocumentDir}/images`;

  if (imageDir) {
    if (Platform.OS === 'android') {
      imagesDirectory = `${parentDirectory.PictureDir}/ForestWatcher`;
    }
  }

  const newPath = `${imagesDirectory}/${cleanedUrl.split('/').pop()}`;

  try {
    const isDir = await RNFetchBlob.fs.isDir(imagesDirectory);

    if (!isDir) {
      try {
        await RNFetchBlob.fs.mkdir(imagesDirectory);
      } catch (error) {
        return parseImagePath(newPath);
      }
    }

    await RNFetchBlob.fs.mv(cleanedUrl, newPath)
      .catch((error) => error);

    if (Platform.OS === 'android') {
      await RNFetchBlob.fs.scanFile([{ path: newPath }]);
    }

    return parseImagePath(newPath);
  } catch (error) {
    // To-do error
    return error;
  }
}

export async function checkImageFolder(imageDir) {
  const parentDirectory = RNFetchBlob.fs.dirs;
  const imagesDirectory = `${parentDirectory.DocumentDir}/${imageDir}`;
  const isDir = await RNFetchBlob.fs.isDir(imagesDirectory);

  if (!isDir) {
    try {
      await RNFetchBlob.fs.mkdir(imagesDirectory);
      return imagesDirectory;
    } catch (err) {
      throw new Error(err);
    }
  }
  return imagesDirectory;
}

export async function removeFolder(folder) {
  if (!folder) return false;
  const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${folder}`;
  await RNFetchBlob.fs.unlink(path);
  return true;
}


export async function cacheImageByUrl(url, imageDir, imageFile) {
  const parsedUrl = url.replace(/ /g, '%20');
  const parentDirectory = RNFetchBlob.fs.dirs;
  const imagesDirectory = `${parentDirectory.DocumentDir}/${imageDir}`;
  const isDir = await RNFetchBlob.fs.isDir(imagesDirectory);

  if (!isDir) {
    try {
      await RNFetchBlob.fs.mkdir(imagesDirectory);
    } catch (err) {
      throw new Error(err);
    }
  }

  const filePath = `${imagesDirectory}/${imageFile}`;

  const image = await RNFetchBlob
    .config({ path: filePath })
    .fetch('GET', parsedUrl);

  return parseImagePath(image.path());
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

export async function cacheTiles(cacheConfig) {
  const { tiles, areaId, layerId, layerUrl, extension = 'png' } = cacheConfig;

  if (!tiles || !areaId || !layerId || !layerUrl) throw new Error('Cache tiles params missing', cacheConfig);
  const folder = `${CONSTANTS.files.tiles}/${areaId}/${layerId}`;
  await checkImageFolder(folder);
  const CONCURRENCY = 3;
  let arrayPromises = [];
  try {
    for (let i = 0, tLength = tiles.length; i < tLength; i++) {
      const imageName = `${tiles[i][2]}x${tiles[i][0]}x${tiles[i][1]}.${extension}`;
      const url = layerUrl
        .replace('{z}', tiles[i][2])
        .replace('{x}', tiles[i][0])
        .replace('{y}', tiles[i][1]);

      arrayPromises.push(cacheImageByUrl(url, folder, imageName));
      if (i % CONCURRENCY === 0 && i > 0) {
        await Promise.all(arrayPromises);
        arrayPromises = [];
      }
    }
    if (arrayPromises.length > 0) {
      await Promise.all(arrayPromises);
    }
    return `${folder}/{z}x{x}x{y}.png`;
  } catch (e) {
    console.warn(e);
    // We return the folder with the already downloaded files however will be incomplete.
    return `${folder}/{z}x{x}x{y}.png`;
  }
}
