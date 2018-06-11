// @flow

import type { Question, ReportsState, Template, Answer } from 'types/reports.types';
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

export const parseQuestion = (step: { question: Question, template: Template }, deviceLang: ?string) => {
  const { question, template } = step;
  const lang = template.languages.includes(deviceLang) ? deviceLang : template.defaultLanguage;
  let parsedQuestion = { ...question };
  const whitelist = ['defaultValue', 'label', 'values', 'name'];
  whitelist.forEach((key: string) => {
    if (typeof parsedQuestion[key] === 'object') {
      let value;
      const hasValue = typeof parsedQuestion[key][lang] !== 'undefined';
      if (hasValue) {
        value = parsedQuestion[key][lang];
      } else {
        value = parsedQuestion[key][template.defaultLanguage] || '';
      }
      parsedQuestion = { ...parsedQuestion, [key]: value };
    }
  });
  if (parsedQuestion.childQuestions) {
    // TODO: Support more than one child question... one day...
    const child = parsedQuestion.childQuestions[0];
    parsedQuestion.childQuestions = child
      ? parseQuestion({ question: child, template }, deviceLang)
      : null;
  }
  return parsedQuestion;
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
  step: { currentQuestion: number, questions: Array<Question>, answers: Array<Answer> }
  ): ?number => {
  const { currentQuestion, questions, answers } = step;
  if (questions && currentQuestion < questions.length - 1) {
    const getJump = (currentIndex: number = 0, jumpStart: number = 0) => {
      const jump = jumpStart + 1;
      const question = questions[currentIndex + 1];
      const conditions = question.conditions;
      const nextHasConditions = conditions && conditions.length > 0;
      const answer = answers[currentIndex] || {};
      const answerMatchesCondition = nextHasConditions && answer.value === conditions[0].value;
      if (
        !nextHasConditions
        || answerMatchesCondition
        || (questions.length - 1) === currentIndex + 1
      ) {
        return jump;
      }
      return getJump(currentIndex + 1, jump);
    };
    const next = getJump(currentQuestion);
    return currentQuestion + next;
  }
  return null;
};

export const isQuestionAnswered = (answer: Answer) => {
  if (!answer) return false;
  return answer.value !== '';
};
