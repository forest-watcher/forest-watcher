
export const getBtnTextByType = (type) => {
  switch (type) {
    case 'text':
      return 'report.inputText';
    case 'radio':
      return 'report.inputRadio';
    case 'select':
      return 'report.inputSelect';
    default:
      return 'report.input';
  }
};

export const parseQuestion = ({ question, form }, deviceLang) => {
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
};

export const getAnswers = (forms, formName) => {
  if (!forms) return null;
  if (forms[formName] && forms[formName].values) return forms[formName].values;
  return {};
};

export const getForm = (state, formName) => {
  switch (formName) {
    case 'daily':
      return state.feedback.daily && state.feedback.daily;
    case 'weekly':
      return state.feedback.weekly && state.feedback.weekly;
    default:
      return state.reports.forms && state.reports.forms;
  }
};

export const getNextStep = ({ currentQuestion, questions, answers }) => {
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
    return currentQuestion + next;
  }
  return null;
};

export const getFormFields = (form, answers) => {
  const fields = [0];
  form.questions.forEach((question, index) => {
    const nextStep = getNextStep({ currentQuestion: index, questions: form.questions, answers });
    if (nextStep) fields.push(nextStep);
  });
  return fields.map(field => form.questions[field].name);
};

export default { getBtnTextByType, parseQuestion, getForm, getAnswers, getFormFields, getNextStep };
