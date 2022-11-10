// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import i18n from 'i18next';
import { connect } from 'react-redux';
import { getNextStep, parseQuestion, getBtnTextByType, isQuestionAnswered } from 'helpers/forms';
import { setReportAnswer } from 'redux-modules/reports';

import ReportForm from 'components/form';
import type { Template } from 'types/reports.types';

type OwnProps = {|
  reportName: string,
  questionIndex: number,
  editMode: boolean,
  template: Template,
  isModal: Boolean
|};

const mapStateToProps = (state: State, ownProps: OwnProps) => {
  const lang = state.app.language || 'en';
  const { reportName, questionIndex = 0, editMode } = ownProps;
  const { answers = [] } = state.reports.list[reportName] || {};
  const template =
    state.reports.list[reportName]?.template ||
    state.reports.templates[(ownProps.template?.id)] ||
    state.reports.templates['default'];
  const { questions = [] } = template;

  const question = parseQuestion({ template, question: questions[questionIndex] }, lang);
  const defaultAnswer = {
    value: '',
    questionName: question.name,
    child: question.childQuestion ? { value: '', questionName: question.childQuestion.name } : null
  };
  const answer = answers.find(a => a.questionName === question.name) || defaultAnswer;
  const nextStep = getNextStep({ currentQuestion: questionIndex, questions, answers });
  const questionAnswered = isQuestionAnswered(answer);
  const text =
    questionAnswered || !question.required
      ? editMode
        ? i18n.t('commonText.done')
        : i18n.t('commonText.next')
      : getBtnTextByType(question.type);

  const nextQuestionAnswer = answers.find(ans => ans.questionName === (nextStep && questions[nextStep].name));
  const nextQuestionIndex = typeof nextQuestionAnswer !== 'undefined' && editMode ? null : nextStep;
  // Necessary for `blob` until we have the "cache" selection ready
  // because the image won't change the path on the report
  // but we don't want to clear following answers
  const updateOnly = ownProps.updateOnly || question.type === 'blob';
  return {
    question,
    answer,
    nextQuestionIndex,
    text,
    questionAnswered,
    updateOnly
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setReportAnswer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ReportForm);
