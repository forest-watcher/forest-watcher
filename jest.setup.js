// Setup global Buffer if not available (needed for fileManagement)
global.Buffer = global.Buffer || require('buffer').Buffer;

// Setup btoa/atob if not available
if (typeof global.btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str).toString('base64');
  };
}

if (typeof global.atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return Buffer.from(b64Encoded, 'base64').toString();
  };
}

// Mock React Native modules
jest.mock('react-native-fs', () => ({
  TemporaryDirectoryPath: '/tmp',
  readDir: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
  copyFile: jest.fn(),
  moveFile: jest.fn(),
  stat: jest.fn()
}));

jest.mock('rn-fetch-blob', () => ({
  fs: {
    readStream: jest.fn(() => ({
      open: jest.fn(),
      onData: jest.fn(),
      onEnd: jest.fn(),
      onError: jest.fn()
    })),
    writeFile: jest.fn()
  }
}));

jest.mock('react-native-zip-archive', () => ({
  unzip: jest.fn()
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  }
}));
