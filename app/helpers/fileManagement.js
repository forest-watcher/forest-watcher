import RNFetchBlob from 'react-native-fetch-blob';

export async function storeImage(url) {
  const dirs = RNFetchBlob.fs.dirs;
  const imagesDir = `${dirs.DocumentDir}/images/`;
  const newPath = `${dirs.DocumentDir}/images/${url.split('/').pop()}`;

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
