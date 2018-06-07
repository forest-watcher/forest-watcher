// @flow
import type { State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getTemplate, getNextStep, parseQuestion, getBtnTextByType } from 'helpers/forms';
import { setReportAnswer } from 'redux-modules/reports';

import ReportForm from 'components/form';

const mapStateToProps = (state: State, ownProps: { reportName: string, questionIndex: string }) => {
  const { deviceLang } = state.app;
  const { reportName, questionIndex = 0 } = ownProps;
  const { answers } = state.reports.list[reportName];
  const template = getTemplate(state.reports, reportName);
  const { questions = [] } = template;

  const question = parseQuestion({ form: template, question: questions[questionIndex] }, deviceLang);
  const answer = answers.find(a => a.questionName === question.name)
    || { questionName: question.name };
  const nextQuestionIndex = getNextStep({ currentQuestion: questionIndex, questions, answers });
  const text = getBtnTextByType(question.type);
  return { question, answer, nextQuestionIndex, text };
};

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  onSubmit: setReportAnswer
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ReportForm);
