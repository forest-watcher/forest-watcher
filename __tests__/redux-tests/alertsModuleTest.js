import 'react-native';
import alertsReducer, {
  getAreaAlerts,
  setActiveAlerts,
  setCanDisplayAlerts
} from 'redux-modules/alerts';
// todo test realm actions: resetAlertsDb & saveAlertsToDb ?

describe('Redux Alerts Module', () => {
  describe('Simple Actions: snapshot and reducer test', () => {
    // Snapshot tests the action object and the reducer state
    function simpleActionTest(action) {
      expect(action).toMatchSnapshot();
      expect(alertsReducer(undefined, action)).toMatchSnapshot();
    }

    it('setActiveAlerts', () => {
      simpleActionTest(setActiveAlerts());
    });

    it('setCanDisplayAlerts', () => {
      simpleActionTest(setCanDisplayAlerts(true));
      simpleActionTest(setCanDisplayAlerts(false));
    });

    it('getAreaAlerts', () => {
      const mockArea = { id: 'areaID', geostore: { id: 'geostoreID' } };
      simpleActionTest(getAreaAlerts(mockArea, 'datasetSlugMock', 10));
    });
  });
});
