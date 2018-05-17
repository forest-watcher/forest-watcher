// @flow

import type { Question, ReportsState, Template } from 'types/reports.types';
import type { Answers, FormState } from 'types/form.types';

export const getBtnTextByType = (type: string) => {
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

export const parseQuestion = (step: { question: Question, form: Template }, deviceLang: string) => {
  const { question, form } = step;
  const lang = form.languages.includes(deviceLang) ? deviceLang : form.defaultLanguage;
  let parsedQuestion = { ...question };
  const whitelist = ['defaultValue', 'label', 'values', 'name'];
  whitelist.forEach((key: string) => {
    if (typeof parsedQuestion[key] === 'object') {
      let value;
      const hasValue = typeof parsedQuestion[key][lang] !== 'undefined';
      if (hasValue) {
        value = parsedQuestion[key][lang];
      } else {
        value = parsedQuestion[key][form.defaultLanguage] || '';
      }
      parsedQuestion = { ...parsedQuestion, [key]: value };
    }
  });
  if (parsedQuestion.childQuestions) {
    parsedQuestion.childQuestions = parsedQuestion.childQuestions.map((child) => parseQuestion({ question: child, form }, deviceLang));
  }
  return parsedQuestion;
};

export const getAnswers = (forms: FormState, formName: string) => {
  if (!forms) return null;
  if (forms[formName] && forms[formName].values) return forms[formName].values;
  return {};
};

export const getTemplate = (reports: ReportsState, formName: string) => {
  const list = reports.list[formName];
  const status = templateId => (
    reports.templates[templateId] && reports.templates[templateId].status
  );
  const templateId = list && list.area.templateId && status(list.area.templateId) !== 'unpublished' ?
    list.area.templateId : 'default';
  return Object.assign({}, reports.templates[templateId]);
};

export const getNextStep = (step: { currentQuestion: number, questions: Array<Question>, answers: Answers }) => {
  const { currentQuestion, questions, answers } = step;
  let next = 1;
  if (questions && currentQuestion < questions.length - 1) {
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

export const getFormFields = (template: Template, answers: Answers) => {
  const fields = [0];
  template.questions.forEach((question, index) => {
    const nextStep = getNextStep({ currentQuestion: index, questions: template.questions, answers });
    if (nextStep) fields.push(nextStep);
  });
  return fields.map(field => template.questions[field].name);
};

export const isQuestionAnswered = (question: Question, answers: Answers) => {
  if (!question) return false;
  if (question.type !== 'blob') {
    return typeof answers[question.name] !== 'undefined';
  }
  return typeof answers[question.name] === 'string' && !!answers[question.name].length;
};

export default {
  getBtnTextByType,
  parseQuestion,
  getTemplate,
  getAnswers,
  getFormFields,
  getNextStep,
  isQuestionAnswered
};
