import 'react-native';
import alertsReducer, { getAreaAlerts } from 'redux-modules/alerts';
// todo test realm actions: resetAlertsDb & saveAlertsToDb ?

describe('Redux Alerts Module', () => {
  it('Initial reducer state', () => {
    expect(alertsReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
  });

  describe('Simple Actions: snapshot and reducer test', () => {
    // Snapshot tests the action object and the reducer state
    function simpleActionTest(action) {
      expect(action).toMatchSnapshot();
      expect(alertsReducer(undefined, action)).toMatchSnapshot();
    }

    it('getAreaAlertsWithConfidence', () => {
      const mockArea = { id: 'areaID', geostore: { id: 'geostoreID' } };
      simpleActionTest(
        getAreaAlerts(
          mockArea,
          'datasetSlugMock',
          {
            query: {
              confidenceKey: 'confidenceKeyMock',
              datastoreId: 'datasetSlugMock',
              dateKey: 'dateKeyMock',
              minDateKey: 'minDateKeyMock',
              tableName: 'tableNameMock'
            }
          },
          new Date(Date.UTC(2021, 4, 25, 12, 0, 0))
        )
      );
    })

    it('getAreaAlerts', () => {
      const mockArea = { id: 'areaID', geostore: { id: 'geostoreID' } };
      simpleActionTest(
        getAreaAlerts(
          mockArea,
          'datasetSlugMock',
          {
            query: {
              datastoreId: 'datasetSlugMock',
              dateKey: 'dateKeyMock',
              minDateKey: 'minDateKeyMock',
              tableName: 'tableNameMock'
            }
          },
          new Date(Date.UTC(2021, 4, 25, 12, 0, 0))
        )
      );
    });
  });
});
