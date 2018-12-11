import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import reportsReducer, {
  createReport,
  deleteReport,
  getDefaultReport,
  saveReport,
  setReportAnswer,
  syncReports,
  uploadReport
} from 'redux-modules/reports';

describe('Redux Reports Module', () => {
  const mockArea = {
    name: 'nameMock',
    id: 'areaIDMock',
    application: 'applicationMock', // used to test that all fields are included in payload
    geostore: { id: 'geostoreIDMock' }
  };

  const mockReport = {
    name: 'reportNameMock',
    area: mockArea,
    userPosition: '1,2',
    clickedPosition: '3,4',
    index: 1,
    status: 'draft',
    date: 'mockDateString',
    answers: []
  };

  const mockAnswerChild = {
    questionName: 'mockQuestionName2',
    value: 'Value2'
  };

  const mockAnswerParent = {
    questionName: 'mockQuestionName1',
    value: 'Value1',
    child: mockAnswerChild
  };

  const mockReportWithAnswers = {
    ...mockReport,
    answers: [mockAnswerParent]
  };

  it('Initial reducer state', () => {
    expect(reportsReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
  });

  describe('Simple Actions: snapshot and reducer test', () => {
    // Snapshot tests the action object and the reducer state
    function simpleActionTest(action, propertyMatcher) {
      const actionPropertyMatcher = propertyMatcher ? { payload: propertyMatcher } : {};
      const statePropertyMatcher = propertyMatcher ? { list: propertyMatcher } : {};
      expect(action).toMatchSnapshot(actionPropertyMatcher);
      expect(reportsReducer(undefined, action)).toMatchSnapshot(statePropertyMatcher);
    }

    it('createReport', () => {
      const propertyMatcher = { mockReportName: { date: expect.any(String) } };
      simpleActionTest(
        createReport({
          reportName: 'mockReportName',
          userPosition: '1,2',
          clickedPosition: '3,4',
          area: mockArea
        }),
        propertyMatcher
      );
    });

    it('deleteReport', () => {
      simpleActionTest(deleteReport('mockReportName'));
    });

    it('getDefaultReport', () => {
      simpleActionTest(getDefaultReport());
    });

    it('saveReport', () => {
      simpleActionTest(saveReport(mockReport.name, mockReport));
    });

    it('saveReport with answers', () => {
      simpleActionTest(saveReport(mockReportWithAnswers.name, mockReportWithAnswers));
    });

    it('setReportAnswer', () => {
      simpleActionTest(setReportAnswer('mockReportName', mockAnswerParent, true));
      // simpleActionTest(setReportAnswer('mockReportName', mockAnswerParent, false));
    });

    // TODO FUll TEST : create, delete, save, set answer
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      // initialStoreState = { app: reportsReducer(undefined, { type: 'NONE' }) };
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    // if changing this method, change in other tests too
    function mockDispatchAction(state, action, test = true) {
      const newStore = configuredStore({ app: state });
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state;
      // should only be one but the loop is used for future changes and so all tests conform.
      resolvedActions.forEach(resolvedAction => {
        newState = reportsReducer(newState, resolvedAction);
      });
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot();
      }
      return newState;
    }
  });
});
