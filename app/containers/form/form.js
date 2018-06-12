// @flow
import type { State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import i18n from 'locales';
import { connect } from 'react-redux';
import { getTemplate, getNextStep, parseQuestion, getBtnTextByType, isQuestionAnswered } from 'helpers/forms';
import { setReportAnswer } from 'redux-modules/reports';

import ReportForm from 'components/form';

const mapStateToProps = (
  state: State,
  ownProps: { reportName: string, questionIndex: number, editMode: boolean }
) => {
  const lang = state.app.language || 'en';
  const { reportName, questionIndex = 0, editMode } = ownProps;
  const { answers = [] } = state.reports.list[reportName] || {};
  const template = getTemplate(state.reports, reportName);
  const { questions = [] } = template;

  const question = parseQuestion({ template, question: questions[questionIndex] }, lang);
  const defaultAnswer = {
    value: '',
    questionName: question.name,
    child: question.childQuestions
      ? { value: '', questionName: question.childQuestion.name }
      : null
  };
  const answer = answers.find(a => a.questionName === question.name) || defaultAnswer;
  const nextStep = getNextStep({ currentQuestion: questionIndex, questions, answers });
  const questionAnswered = isQuestionAnswered(answer);
  const text = questionAnswered || !question.required
    ? i18n.t('commonText.next')
    : getBtnTextByType(question.type);

  const nextQuestionAnswer = answers.find(ans => ans.questionName === (nextStep && questions[nextStep].name));
  const nextQuestionIndex = typeof nextQuestionAnswer !== 'undefined' && editMode ? null : nextStep;
  // Necesary until we have the "cache" selection ready
  // because the imagen won't change the path on the report
  // but we don't want to clear following answers
  const updateOnly = question.type === 'blob';
  return {
    question,
    answer,
    nextQuestionIndex,
    text,
    questionAnswered,
    updateOnly
  };
};

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  setReportAnswer
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ReportForm);
