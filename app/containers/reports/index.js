// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { getNextStep } from 'helpers/forms';
import { showExportReportsSuccessfulNotification } from 'redux-modules/app';

import Reports from 'components/reports';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';
import type { Report } from 'types/reports.types';

export type FormattedReport = Report & {
  title: string,
  imported: boolean
};

export type FormattedReports = {
  draft?: FormattedReport,
  complete?: FormattedReport,
  uploaded?: FormattedReport
};

export function getReports(reports, areas, userId): FormattedReports {
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
        imported: isImported(report.area?.id, areas, userId),
        title: key
      });
    }
  });
  return sortReports(data);
}

function isImported(reportAreaId, areas, userId) {
  if (!reportAreaId) {
    return true;
  }
  const reportArea = areas.find(area => area.id === reportAreaId);
  return !(reportArea?.userId && reportArea.userId === userId);
}

function sortReports(reports) {
  const sorted = {};
  Object.keys(reports).forEach(status => {
    sorted[status] = reports[status].sort((a, b) => b.date - a.date);
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
    reports: getReports(state.reports.list, state.areas.data, state.user.data.id),
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
