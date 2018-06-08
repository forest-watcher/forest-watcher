// @flow
import type { State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import i18n from 'locales';
import { connect } from 'react-redux';
import { getTemplate, getNextStep, parseQuestion, getBtnTextByType, isQuestionAnswered } from 'helpers/forms';
import { setReportAnswer } from 'redux-modules/reports';

import ReportForm from 'components/form';

const mapStateToProps = (state: State, ownProps: { reportName: string, questionIndex: number }) => {
  const { language } = state.app;
  const { reportName, questionIndex = 0 } = ownProps;
  const { answers } = state.reports.list[reportName];
  const template = getTemplate(state.reports, reportName);
  const { questions = [] } = template;

  const question = parseQuestion({ template, question: questions[questionIndex] }, language);
  const answer = answers.find(a => a.questionName === question.name)
    || { questionName: question.name, value: '' };
  const nextQuestionIndex = getNextStep({ currentQuestion: questionIndex, questions, answers });
  const questionAnswered = isQuestionAnswered(answer);
  const text = questionAnswered
    ? i18n.t('commonText.next')
    : getBtnTextByType(question.type);
  return { question, answer, nextQuestionIndex, text, questionAnswered };
};

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  setReportAnswer
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ReportForm);
