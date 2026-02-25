// Mock React Native dependencies first to prevent import errors
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

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  }
}));

jest.mock('helpers/fwError', () => {
  class FWError extends Error {
    code?: string;
    constructor(options: any) {
      super(options?.message || 'FWError');
      this.code = options?.code;
    }
  }
  return {
    __esModule: true,
    default: FWError,
    ERROR_CODES: {
      FILE_TOO_LARGE: 'FILE_TOO_LARGE'
    }
  };
});

// Mock dependencies before importing the module under test
jest.mock('helpers/fileManagement');
jest.mock('helpers/toGeoJSON');

// Create mock functions that we can access in tests
const mockParseFromString = jest.fn();
const mockDOMParserConstructor = jest.fn().mockImplementation(() => ({
  parseFromString: mockParseFromString
}));

jest.mock('@xmldom/xmldom', () => ({
  DOMParser: mockDOMParserConstructor
}));

import convertToGeoJSON from '../convertToGeoJSON';
import { readTextFile } from 'helpers/fileManagement';
import togeojson from 'helpers/toGeoJSON';
import { FeatureCollection } from '@turf/helpers';

const mockReadTextFile = readTextFile as jest.MockedFunction<typeof readTextFile>;
const mockTogeojson = togeojson as jest.Mocked<typeof togeojson>;

describe('convertToGeoJSON', () => {
  let mockXmlDoc: Document;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a mock XML document
    mockXmlDoc = {
      documentElement: {
        nodeName: 'kml',
        childNodes: []
      }
    } as unknown as Document;

    // Setup the mock to return the XML document
    mockParseFromString.mockReturnValue(mockXmlDoc);
  });

  describe('KML file conversion', () => {
    it('should convert a KML file to GeoJSON', async () => {
      const mockKmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <name>Test Placemark</name>
    <Point>
      <coordinates>-122.4194,37.7749,0</coordinates>
    </Point>
  </Placemark>
</kml>`;

      const mockGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-122.4194, 37.7749]
            },
            properties: {
              name: 'Test Placemark'
            }
          }
        ]
      };

      mockReadTextFile.mockResolvedValue(mockKmlContent);
      mockTogeojson.kml = jest.fn().mockReturnValue(mockGeoJSON);

      const result = await convertToGeoJSON('file:///test.kml', 'kml');

      expect(mockReadTextFile).toHaveBeenCalledWith('file:///test.kml');
      expect(mockDOMParserConstructor).toHaveBeenCalled();
      expect(mockParseFromString).toHaveBeenCalledWith(mockKmlContent);
      expect(mockTogeojson.kml).toHaveBeenCalledWith(mockXmlDoc, { styles: true });
      expect(mockTogeojson.gpx).not.toHaveBeenCalled();
      expect(result).toEqual(mockGeoJSON);
    });

    it('should handle KML files with styles option', async () => {
      const mockKmlContent = '<kml></kml>';
      const mockGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      mockReadTextFile.mockResolvedValue(mockKmlContent);
      mockTogeojson.kml = jest.fn().mockReturnValue(mockGeoJSON);

      await convertToGeoJSON('file:///test.kml', 'kml');

      expect(mockTogeojson.kml).toHaveBeenCalledWith(mockXmlDoc, { styles: true });
    });
  });

  describe('GPX file conversion', () => {
    it('should convert a GPX file to GeoJSON', async () => {
      const mockGpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <wpt lat="37.7749" lon="-122.4194">
    <name>Test Waypoint</name>
  </wpt>
</gpx>`;

      const mockGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-122.4194, 37.7749]
            },
            properties: {
              name: 'Test Waypoint'
            }
          }
        ]
      };

      mockReadTextFile.mockResolvedValue(mockGpxContent);
      mockTogeojson.gpx = jest.fn().mockReturnValue(mockGeoJSON);

      const result = await convertToGeoJSON('file:///test.gpx', 'gpx');

      expect(mockReadTextFile).toHaveBeenCalledWith('file:///test.gpx');
      expect(mockDOMParserConstructor).toHaveBeenCalled();
      expect(mockParseFromString).toHaveBeenCalledWith(mockGpxContent);
      expect(mockTogeojson.gpx).toHaveBeenCalledWith(mockXmlDoc, { styles: true });
      expect(mockTogeojson.kml).not.toHaveBeenCalled();
      expect(result).toEqual(mockGeoJSON);
    });

    it('should handle GPX files with styles option', async () => {
      const mockGpxContent = '<gpx></gpx>';
      const mockGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      mockReadTextFile.mockResolvedValue(mockGpxContent);
      mockTogeojson.gpx = jest.fn().mockReturnValue(mockGeoJSON);

      await convertToGeoJSON('file:///test.gpx', 'gpx');

      expect(mockTogeojson.gpx).toHaveBeenCalledWith(mockXmlDoc, { styles: true });
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from readTextFile', async () => {
      const error = new Error('File read failed');
      mockReadTextFile.mockRejectedValue(error);

      await expect(convertToGeoJSON('file:///invalid.kml', 'kml')).rejects.toThrow('File read failed');
      expect(mockDOMParserConstructor).not.toHaveBeenCalled();
    });

    it('should propagate errors from DOMParser', async () => {
      const mockKmlContent = '<kml></kml>';
      mockReadTextFile.mockResolvedValue(mockKmlContent);
      mockParseFromString.mockImplementation(() => {
        throw new Error('XML parsing failed');
      });

      await expect(convertToGeoJSON('file:///test.kml', 'kml')).rejects.toThrow('XML parsing failed');
    });

    it('should propagate errors from togeojson conversion', async () => {
      const mockKmlContent = '<kml></kml>';
      mockReadTextFile.mockResolvedValue(mockKmlContent);
      mockTogeojson.kml = jest.fn().mockImplementation(() => {
        throw new Error('GeoJSON conversion failed');
      });

      await expect(convertToGeoJSON('file:///test.kml', 'kml')).rejects.toThrow('GeoJSON conversion failed');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty XML content', async () => {
      const mockKmlContent = '';
      const mockGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      mockReadTextFile.mockResolvedValue(mockKmlContent);
      mockTogeojson.kml = jest.fn().mockReturnValue(mockGeoJSON);

      const result = await convertToGeoJSON('file:///empty.kml', 'kml');

      expect(mockParseFromString).toHaveBeenCalledWith('');
      expect(result).toEqual(mockGeoJSON);
    });

    it('should handle different file URI formats', async () => {
      const mockKmlContent = '<kml></kml>';
      const mockGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      mockReadTextFile.mockResolvedValue(mockKmlContent);
      mockTogeojson.kml = jest.fn().mockReturnValue(mockGeoJSON);

      const uris = [
        'file:///test.kml',
        'content://test.kml',
        '/absolute/path/test.kml',
        'relative/path/test.kml'
      ];

      for (const uri of uris) {
        await convertToGeoJSON(uri, 'kml');
        expect(mockReadTextFile).toHaveBeenCalledWith(uri);
      }
    });
  });
});
