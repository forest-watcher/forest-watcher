// @flow

import type { Question, ReportsState, Template, Answer } from 'types/reports.types';
import i18n from 'locales';
import flatMap from 'lodash/flatMap';

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
  if (parsedQuestion.childQuestions && parsedQuestion.childQuestions.length > 0) {
    // TODO: Support more than one child question... one day...
    const child = parsedQuestion.childQuestions[0];
    parsedQuestion.childQuestion =
      typeof child !== 'undefined' ? parseQuestion({ question: child, template }, deviceLang) : null;
  }
  return parsedQuestion;
};

export const getTemplate = (reports: ReportsState, formName: string) => {
  const list = reports.list[formName];
  const status = templateId => reports.templates[templateId] && reports.templates[templateId].status;
  const templateId =
    list && list.area.templateId && status(list.area.templateId) !== 'unpublished' ? list.area.templateId : 'default';
  return Object.assign({}, reports.templates[templateId]);
};

export const getNextStep = (step: {
  currentQuestion: number,
  questions: Array<Question>,
  answers: Array<Answer>
}): ?number => {
  const { currentQuestion, questions, answers } = step;
  if (questions && currentQuestion < questions.length - 1) {
    const getJump = (currentIndex: number = 0, jumpStart: number = 0) => {
      const jump = jumpStart + 1;
      const question = questions[currentIndex + 1];
      const conditions = question.conditions;
      const answer = answers[currentIndex] || {};
      const isLastQuestion = questions.length - 1 === currentIndex + 1;
      const nextHasConditions = conditions && conditions.length > 0;
      const answerMatchesCondition = nextHasConditions && answer.value === conditions[0].value;
      if (nextHasConditions && !answerMatchesCondition && isLastQuestion) {
        return null;
      }
      return !nextHasConditions || answerMatchesCondition || isLastQuestion ? jump : getJump(currentIndex + 1, jump);
    };
    const next = getJump(currentQuestion);
    return next !== null ? currentQuestion + next : null;
  }
  return null;
};

export const isQuestionAnswered = (answer: Answer) => {
  if (!answer) return false;
  return answer.value !== '';
};

function getAnswerValues(question, answer) {
  if (typeof answer === 'undefined') return undefined;
  const simpleTypeInputs = ['number', 'text', 'point', 'blob'];
  let value = Array.isArray(answer.value) ? answer.value : [answer.value];
  if (!simpleTypeInputs.includes(question.type)) {
    value = question.values.filter(item => value.includes(item.value)).map(item => item.label);
  }
  return { ...answer, value };
}

export function mapFormToAnsweredQuestions(answers: Array<Answer>, template: Template, deviceLang: ?string) {
  const questions = flatMap(template.questions, question => {
    const parsedQuestion = parseQuestion({ template, question }, deviceLang);
    if (parsedQuestion.childQuestion) {
      const parsedChildQuestion = {
        ...parsedQuestion.childQuestion,
        order: parsedQuestion.order
      };
      return [parsedQuestion, parsedChildQuestion];
    }
    return parsedQuestion;
  }).reduce((acc, question) => ({ ...acc, [question.name]: question }), {});
  return flatMap(answers, answer => {
    const question = questions[answer.questionName];
    const answeredQuestion = {
      question,
      answer: getAnswerValues(question, answer)
    };

    const hasChild = answer.child && answer.child !== null;
    const childMatchCondition =
      hasChild && question.childQuestion && answer.value === question.childQuestion.conditionalValue;
    if (childMatchCondition) {
      const childQuestion = questions[answer.child.questionName];
      return [
        answeredQuestion,
        {
          question: childQuestion,
          answer: getAnswerValues(childQuestion, answer.child)
        }
      ];
    }

    return answeredQuestion;
  });
}
