// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { getNextStep } from 'helpers/forms';
import { shouldBeConnected } from 'helpers/app';

import Reports from 'components/reports';

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
        title: key,
        position: report.position,
        date: report.date
      });
    }
  });
  return sortReports(data);
}

function sortReports(reports) {
  const sorted = {};
  Object.keys(reports).forEach(status => {
    const section = reports[status].sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return +1;
      return 0;
    });
    sorted[status] = section;
  });
  return sorted;
}

function mapStateToProps(state: State) {
  return {
    isConnected: shouldBeConnected(state),
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

export default connect(mapStateToProps)(Reports);
