import { connect } from 'react-redux';
import { getBtnTextByType, getBtnTextByPosition } from 'helpers/forms';
import FormStep from 'components/common/form/form-step';

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

function parseQuestion({ question, form }, deviceLang) {
  const lang = form.languages.includes(deviceLang) ? deviceLang : form.defaultLanguage;
  let parsedQuestion = { ...question };
  const whitelist = ['defaultValue', 'label', 'values', 'name'];
  whitelist.forEach((key) => {
    if (typeof parsedQuestion[key] === 'object' && typeof parsedQuestion[key][lang] !== 'undefined') {
      parsedQuestion = { ...parsedQuestion, [key]: parsedQuestion[key][lang] };
    }
  });
  if (parsedQuestion.childQuestions) {
    parsedQuestion.childQuestions = parsedQuestion.childQuestions.map((child) => parseQuestion({ question: child, form }, deviceLang));
  }
  return parsedQuestion;
}

function getNextCallback({ currentQuestion, questions, answers, navigator, form, screen, title, texts, finish }) {
  let next = 1;
  if (currentQuestion < questions.length - 1) {
    for (let i = currentQuestion + 1, qLength = questions.length; i < qLength; i++) {
      const nextConditions = questions[i].conditions;
      const nextHasConditions = nextConditions && nextConditions.length > 0;

      if (!nextHasConditions || (answers[nextConditions[0].name] === nextConditions[0].value)) {
        break;
      }
      next += 1;
    }
    return () => navigator.push({
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
  }
  return () => {
    finish(form);
    navigator.popToRoot({ animate: true });
  };
}

function mapStateToProps(state, { form, index, texts, questionsToSkip, finish, title, screen, navigator }) {
  const questions = getQuestions(state, form);
  const question = questions && questions[index];
  const parsedQuestion = question && parseQuestion({ question, form: state.reports.forms }, state.app.language);
  const answers = getAnswers(state.form, form);
  const answer = typeof answers[question.name] !== 'undefined' || null;
  const nextText = !answer && question.required ? getBtnTextByType(question.type) : getBtnTextByPosition(index, questions.length - 1);

  return {
    form,
    texts,
    questionsToSkip,
    question: parsedQuestion,
    answer,
    navigator,
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
        isConnected: state.offline.online
      })
    }
  };
}


export default connect(
  mapStateToProps,
  null
)(FormStep);
