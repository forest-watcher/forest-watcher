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
    geostore: { id: 'geostoreIDMock' },
    templateId: 'templateIDMock'
  };

  const mockCreateReport = {
    reportName: 'mockCreateReportName',
    userPosition: '[1,2]',
    clickedPosition: '[3,4]',
    area: mockArea
  };

  const mockReport = {
    reportName: 'reportNameMock',
    area: mockArea,
    userPosition: '[1,2]',
    clickedPosition: '[3,4]',
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
      simpleActionTest(saveReport(mockReport.reportName, mockReport));
    });

    it('saveReport with answers', () => {
      simpleActionTest(saveReport(mockReportWithAnswers.reportName, mockReportWithAnswers));
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

    function mockDispatchAction(state, action, statePropertyMatcher, actionPropertyMatcher) {
      // slightly different implementation in this redux module test.
      const newStore = configuredStore(state);
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state.reports;

      const actionPropertyMatcherObj = actionPropertyMatcher ? { payload: actionPropertyMatcher } : {};
      const statePropertyMatcherObj = statePropertyMatcher ? { list: statePropertyMatcher } : {};

      if (resolvedActions.length === 0) {
        expect('NO_RESOLVED_ACTIONS').toMatchSnapshot();
      } else {
        resolvedActions.forEach(resolvedAction => {
          newState = reportsReducer(newState, resolvedAction);
          expect(resolvedAction).toMatchSnapshot(actionPropertyMatcherObj);
        });
      }

      expect(newState).toMatchSnapshot(statePropertyMatcherObj);

      const returnState = {
        ...state,
        reports: {
          ...newState
        }
      };
      return returnState;
    }

    it('syncReports', () => {
      store.dispatch(syncReports());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('uploadReport', () => {
      const state = {
        reports: {
          list: {
            reportNameMock: {
              ...mockReport,
              area: {
                ...mockReport.area,
                dataset: {
                  startDate: 'startDateMock',
                  endDate: 'endDateMock',
                  slug: 'slugMock'
                }
              }
            }
          },
          templates: {
            templateIDMock: { status: 'published', id: 'templateIDMock' },
            templateIDMock2: { status: 'unpublished', id: 'templateIDMock2' }
          }
        },
        app: { language: 'languageMock' },
        user: { data: { fullName: 'fullNameMock', organization: 'organizationMock' } }
      };
      store = configuredStore(state);
      store.dispatch(uploadReport('reportNameMock'));

      expect(store.getActions()).toMatchSnapshot();
    });

    it('simple report actions full test', () => {
      let newState = {
        reports: reportsReducer(undefined, { type: 'NONE' })
      };

      const dataString = { date: expect.any(String) };

      // Create report 1
      newState = mockDispatchAction(
        newState,
        createReport(mockCreateReport),
        { mockCreateReportName: dataString },
        { mockCreateReportName: dataString }
      );

      // Create report 2
      const mockCreateReport2 = {
        ...mockCreateReport,
        reportName: mockCreateReport.reportName + '2'
      };
      newState = mockDispatchAction(
        newState,
        createReport(mockCreateReport2),
        { mockCreateReportName: dataString, mockCreateReportName2: dataString },
        { mockCreateReportName2: dataString }
      );

      // Edit entire report 1 (some fields not changed)
      const mockReportEdit = { ...mockReportWithAnswers, reportName: mockCreateReport.reportName };
      newState = mockDispatchAction(
        newState,
        saveReport(mockReportEdit.reportName, mockReportEdit),
        { mockCreateReportName: dataString, mockCreateReportName2: dataString },
        null
      );

      // Edit report 2 status
      newState = mockDispatchAction(
        newState,
        saveReport(mockCreateReport2.reportName, { status: 'complete' }),
        { mockCreateReportName: dataString, mockCreateReportName2: dataString },
        null
      );

      // Set report 1 answer
      const mockNewAnswer = { questionName: 'mockQuestionName1', value: 'Value1a' };
      newState = mockDispatchAction(
        newState,
        setReportAnswer(mockCreateReport.reportName, mockNewAnswer),
        { mockCreateReportName: dataString, mockCreateReportName2: dataString },
        null
      );

      // Set report 2 answer
      newState = mockDispatchAction(
        newState,
        setReportAnswer(mockCreateReport2.reportName, mockAnswerParent),
        { mockCreateReportName: dataString, mockCreateReportName2: dataString },
        null
      );

      // Sync reports
      newState = mockDispatchAction(
        newState,
        syncReports(),
        { mockCreateReportName: dataString, mockCreateReportName2: dataString },
        null
      );

      //Delete report 1
      newState = mockDispatchAction(
        newState,
        deleteReport(mockCreateReport.reportName),
        { mockCreateReportName2: dataString },
        null
      );

      // Sync reports
      newState = mockDispatchAction(
        // Should produce no actions
        newState,
        syncReports(),
        { mockCreateReportName2: dataString },
        null
      );

      newState = {
        ...newState,
        reports: {
          ...newState.reports,
          list: {
            ...newState.reports.list,
            mockCreateReportName2: {
              ...newState.reports.list.mockCreateReportName2,
              date: 'dateMock' // need to mock, property matcher won't work for mocked function parameters
            }
          },
          templates: {
            templateIDMock: { status: 'unpublished' },
            templateIDMock2: { status: 'statusMock' }
          }
        },
        app: { language: 'languageMock' },
        user: { data: { fullName: 'fullNameMock', organization: 'organizationMock' } }
      };

      // Upload report 2
      mockDispatchAction(
        newState,
        uploadReport(mockCreateReport2.reportName),
        { mockCreateReportName2: dataString },
        null
      );
    });
  });
});

global.FormData = function FormDataMock() {
  this.append = jest.fn();
};
