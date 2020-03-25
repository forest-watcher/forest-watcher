import RNFetchBlob from 'rn-fetch-blob';

global.Buffer = global.Buffer || require('buffer').Buffer; // eslint-disable-line

if (typeof btoa === 'undefined') {
  global.btoa = function(str) {
    return new Buffer(str).toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function(b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString();
  };
}

export async function removeFolder(folder) {
  if (!folder) {
    return false;
  }
  const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${folder}`;
  await RNFetchBlob.fs.unlink(path);
  return true;
}
