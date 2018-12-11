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

  const mockCreateReport = {
    reportName: 'mockCreateReportName',
    userPosition: '1,2',
    clickedPosition: '3,4',
    area: mockArea
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
      const propertyMatcher = { mockCreateReportName: { date: expect.any(String) } };
      simpleActionTest(createReport(mockCreateReport), propertyMatcher);
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

    function mockDispatchAction(state, action, propertyMatcher) {
      // slightly different implementation in this redux module test.
      const newStore = configuredStore(state);
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state.layers;
      const actionPropertyMatcher = propertyMatcher ? { payload: propertyMatcher } : {};
      resolvedActions.forEach(resolvedAction => {
        newState = reportsReducer(newState, resolvedAction);
        expect(action).toMatchSnapshot(actionPropertyMatcher);
      });

      const statePropertyMatcher = propertyMatcher ? { list: propertyMatcher } : {};
      expect(newState).toMatchSnapshot(statePropertyMatcher);

      const returnState = {
        ...state,
        layers: {
          ...newState
        }
      };
      return returnState;
    }

    it('syncReports', () => {
      store.dispatch(syncReports()); // todo test sync/syncing
      expect(store.getActions()).toMatchSnapshot();
    });

    it('simple report actions full test', () => {
      let newState = {
        layers: reportsReducer(undefined, { type: 'NONE' }),
        // areas: {
        //   ...initialStoreState.areas,
        //   data: [mockArea]
        // }
      };
      const propertyMatcher = { mockCreateReportName: { date: expect.any(String) } };
      newState = mockDispatchAction(newState, createReport(mockCreateReport), propertyMatcher);
      newState = mockDispatchAction(newState, setOfflineMode(true));
      // mockDispatchAction(newState, showNotConnectedNotification());
    });

    // it('showNotConnectedNotification full test', () => {
    //   let newState = appReducer(undefined, { type: 'NONE' });
    //   newState = mockDispatchAction(newState, showNotConnectedNotification());
    //   newState = mockDispatchAction(newState, setOfflineMode(true));
    //   mockDispatchAction(newState, showNotConnectedNotification());
    // });
  });
});
