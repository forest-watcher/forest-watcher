// @flow

import type { Question, ReportsState, Template, Answers, FormState } from 'types/reports.types';
import i18n from 'locales';

export const getBtnTextByType = (type: string) => {
  switch (type) {
    case 'text':
      return i18n.t('report.inputText');
    case 'radio':
      return i18n.t('report.inputRadio');
    case 'select':
      return i18n.t('report.inputSelect');
    default:
      return i18n.t('report.input');
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

export const getNextStep = (
  step: { currentQuestion: number, questions: Array<Question>, answers: Answers }
  ): ?number => {
  const { currentQuestion, questions, answers } = step;
  if (questions && currentQuestion < questions.length - 1) {
    const findStep = (currentIndex: number = 0, jumpStart: number = 0) => {
      const jump = jumpStart + 1;
      const question = questions[currentIndex];
      const conditions = question.conditions;
      const nextHasConditions = conditions && conditions.length > 0;
      const answer = answers.find(ans => ans.questionName === question.name) || {};
      const answerMatchesCondition = nextHasConditions && answer.value === conditions[0].value;
      if (
        !nextHasConditions
        || answerMatchesCondition
        || (questions.length - 1) === currentIndex
      ) {
        return jump;
      }
      return findStep(currentIndex + 1, jump);
    };
    const next = findStep(currentQuestion);
    return currentQuestion + next;
  }
  return null;
};

export const getFormFields = (template: Template, answers: Answers) => {
  const fields = [0];
  template.questions.forEach((question, index) => {
    const nextStep = getNextStep({ currentQuestion: index, questions: template.questions, answers });
    if (nextStep !== null) {
      fields.push(nextStep);
    }
  });
  const res = fields.map(field => template.questions[field] && template.questions[field].name);
  return res;
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
