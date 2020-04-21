// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { getNextStep } from 'helpers/forms';
import { showExportReportsSuccessfulNotification } from 'redux-modules/app';

import Reports from 'components/reports';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

function getReports(reports) {
  const data = {
    draft: [],
    complete: [],
    uploaded: []
  };
  Object.keys(reports).forEach(key => {
    const report = reports[key];
    if (data[report.status]) {
      data[report.status].push({
        ...report,
        title: key
      });
    }
  });
  return sortReports(data);
}

function sortReports(reports) {
  const sorted = {};
  Object.keys(reports).forEach(status => {
    const section = reports[status].sort((a, b) => {
      if (a.date > b.date) {
        return -1;
      }
      if (a.date < b.date) {
        return +1;
      }
      return 0;
    });
    sorted[status] = section;
  });
  return sorted;
}

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    appLanguage: state.app.language,
    templates: state.reports.templates,
    reports: getReports(state.reports.list),
    getLastStep: formName => {
      const answers = state.reports.list[formName].answers;
      if (answers && answers.length) {
        const templateId = state.reports.list[formName].area.templateId || 'default';
        const questions = state.reports.templates[templateId].questions;
        const last = answers[answers.length - 1];
        const currentQuestion = questions.findIndex(question => (last && last.questionName) === question.name);
        return getNextStep({ currentQuestion, questions, answers });
      }
      // we need to return 0 in case that answers.length === 0,
      // because that means that a form was created but no answer was submitted
      return 0;
    }
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    exportReportsAsBundle: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux({
          reportIds: ids
        })
      );
      await shareBundle(outputPath);
    },
    showExportReportsSuccessfulNotification: () => {
      dispatch(showExportReportsSuccessfulNotification());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
