import { connect } from 'react-redux';
import { getBtnTextByType, getBtnTextByPosition } from 'helpers/forms';
import ReportsForm from 'components/common/form/form-step';

function getAnswers(forms, formName) {
  if (!forms) return null;
  if (forms[formName] && forms[formName].values) return forms[formName].values;
  return {};
}

function getQuestions(state, formName) {
  switch (formName) {
    case 'daily':
      return state.feedback.daily && state.feedback.daily.questions;
    case 'weekly':
      return state.feedback.weekly && state.feedback.weekly.questions;
    default:
      return state.reports.forms && state.reports.forms.questions;
  }
}

function getNextCallback({ currentQuestion, questions, answers, navigator, form, screen, title, texts, finish, isConnected }) {
  let next = 1;
  if (currentQuestion < questions.length - 1) {
    for (let i = currentQuestion + 1, qLength = questions.length; i < qLength; i++) {
      const nextConditions = questions[i].conditions;
      const nexthasConditions = nextConditions && nextConditions.length > 0;
      if (!nexthasConditions || (answers[nextConditions[0].name] === nextConditions[0].value)) {
        break;
      }
      next += 1;
    }
    return () => {
      navigator.push({
        title,
        screen,
        passProps: {
          form,
          texts,
          title,
          screen,
          step: currentQuestion + next
        }
      });
      return true;
    };
  }
  return () => {
    if (!isConnected) return false;
    finish(form);
    navigator.popToRoot({ animate: true });
    return true;
  };
}

function mapStateToProps(state, { form, index, texts, questionsToSkip, finish, title, screen, navigator }) {
  const questions = getQuestions(state, form);
  const question = questions && questions[index];
  const answers = getAnswers(state.form, form);
  const answer = answers[question.name] || null;
  const nextText = !answer && question.required ? getBtnTextByType(question.type) : getBtnTextByPosition(index, questions.length - 1);

  return {
    form,
    texts,
    questionsToSkip,
    question,
    answer,
    next: {
      text: nextText,
      callback: getNextCallback({
        finish,
        navigator,
        form,
        screen,
        title,
        texts,
        currentQuestion: index,
        questions,
        answers,
        isConnected: state.app.isConnected
      })
    }
  };
}


export default connect(
  mapStateToProps,
  null
)(ReportsForm);
