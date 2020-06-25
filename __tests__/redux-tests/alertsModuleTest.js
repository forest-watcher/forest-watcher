import 'react-native';
import alertsReducer, { getAreaAlerts, setActiveAlerts } from 'redux-modules/alerts';
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

    it('setActiveAlerts', () => {
      simpleActionTest(setActiveAlerts());
    });

    it('getAreaAlerts', () => {
      const mockArea = { id: 'areaID', geostore: { id: 'geostoreID' } };
      simpleActionTest(getAreaAlerts(mockArea, 'datasetSlugMock', 10));
    });
  });
});
