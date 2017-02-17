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

    // Check if it exists
    const res = await RNFetchBlob
      .config({
        path: filePath
      })
      .fetch('GET', parsedUrl);

    return res.path();
  } catch (error) {
    // To-do
  }
}
