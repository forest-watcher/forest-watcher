import 'react-native';
import setupReducer, {
  initSetup,
  setSetupArea,
  setSetupCountry
} from 'redux-modules/setup';

describe('Redux Setup Module', () => {
  it('Initial reducer state', () => {
    expect(setupReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
  });

  describe('Simple Actions: snapshot and reducer test', () => {
    // Snapshot tests the action object and the reducer state
    function simpleActionTest(action) {
      expect(action).toMatchSnapshot();
      expect(setupReducer(undefined, action)).toMatchSnapshot();
    }

    it('initSetup', () => {
      simpleActionTest(initSetup());
    });

    it('setSetupArea', () => {
      const mockCountryArea = {
        name: 'nameMock'
      };
      const mockCountryAreaFull = {
        name: 'nameMock', geojson: 'geojsonMock', wdpaid: 'wdpaidMock', id: 'idMock'
      };
      simpleActionTest(setSetupArea({ area: mockCountryArea, snapshot: 'snapshotMock' }));
      simpleActionTest(setSetupArea({ area: mockCountryAreaFull, snapshot: 'snapshotMock' }));
    });

    it('setSetupCountry', () => {
      const mockCountry = {
        name: 'nameMock', iso: 'isoMock', centroid: '{"centroidMock":"mockData"}', bbox: '{"bboxMock":"mockData"}'
      };
      simpleActionTest(setSetupCountry(mockCountry));
    });
  });
});
