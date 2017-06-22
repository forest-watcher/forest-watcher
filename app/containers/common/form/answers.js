import { connect } from 'react-redux';
import { saveReport } from 'redux-modules/reports';
import { getForm, getAnswers, parseQuestion } from 'helpers/forms';
import Answers from 'components/common/form/answers';

function mapFormToAnsweredQuestions(answers, form, deviceLang) {
  const questions = form.questions.map((question) => {
    const parsedQuestion = parseQuestion({ form, question }, deviceLang);
    return {
      question: parsedQuestion,
      answer: answers[question.name]
    };
  });
  return questions;
}

function mapStateToProps(state, { form }) {
  return {
    questions: mapFormToAnsweredQuestions(getAnswers(state.form, form), getForm(state, form), state.app.language)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Answers);
