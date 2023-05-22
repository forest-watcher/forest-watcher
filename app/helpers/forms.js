// @flow

import type { AnsweredQuestion, Metadata, Question, Report, Template, Answer } from 'types/reports.types';

import moment from 'moment';

import { REPORTS } from 'config/constants';
import i18n from 'i18next';
import flatMap from 'lodash/flatMap';
import { readableNameForReportName } from 'helpers/reports';

/**
 * Don't store the exact URI against the answer because this breaks when we share the report.
 * Instead just store a value to indicate that there is an attachment present
 */
export const REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT = 'image/jpeg';

export const REPORT_BLOB_AUDIO_ATTACHMENT_PRESENT = 'audio/mp4';

export const getBtnTextByType = (type: string): string => {
  switch (type) {
    case 'text':
      return i18n.t('report.inputText');
    case 'radio':
      return i18n.t('report.inputRadio');
    case 'select':
      return i18n.t('report.inputSelect');
    case 'audio':
      return i18n.t('commonText.continue');
    default:
      return i18n.t('report.input');
  }
};

/**
 * Converts a question into a form where irrelevant information and languages are stripped
 */
export const parseQuestion = (step: { question: Question, template: Template }, deviceLang: ?string): Question => {
  const { question, template } = step;
  const lang = template.languages.includes(deviceLang) ? deviceLang : template.defaultLanguage;
  let parsedQuestion: Question = { ...question };
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

export const getTemplate = (report: Report, templates: { +[string]: Template }): Template => {
  const status = templateId => templates[templateId] && templates[templateId].status;
  const templateId =
    report && report.area.templateId && status(report.area.templateId) !== 'unpublished'
      ? report.area.templateId
      : 'default';
  return Object.assign({}, templates[templateId]);
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
  } else if (questions && currentQuestion === questions.length - 1) {
    if (
      !isQuestionAnswered(answers[currentQuestion], questions[currentQuestion]) &&
      questions[currentQuestion].required
    ) {
      return currentQuestion;
    }
  }
  return null;
};

export const isQuestionAnswered = (answer: Answer, question: Question): boolean => {
  if (!answer) {
    return false;
  }
  if (question.type === 'audio') {
    return answer.value.length > 0;
  }
  if (answer) return answer.value !== '' && !(answer.value.length !== undefined && answer.value.length === 0);
  return false;
};

function getAnswerValues(question: Question, answer: ?Answer) {
  if (!answer) {
    return undefined;
  }

  const simpleTypeInputs = ['number', 'text', 'point', 'blob'];
  let value = Array.isArray(answer.value) ? answer.value : [answer.value];
  if (question.type === 'audio') {
    if (answer.value.length > 0) {
      value = ['Recording.mp4'];
    }
  } else if (!simpleTypeInputs.includes(question.type)) {
    value = question.values
      ?.filter(item => value.includes(item.value) || value.includes(item.label))
      .map(item => item.label);
  }
  return { ...answer, value };
}

/**
 * Indicates whether or not the specified question-answer pair is for a completed blob question
 */
export function isBlobResponse({ question, answer }: { question: Question, answer: Answer }): boolean {
  return question.type === 'blob' && Array.isArray(answer.value) && !!answer.value?.[0];
}

/**
 * Converts a template into a form where irrelevant information and languages are stripped
 */
export function mapFormToQuestions(template: Template, deviceLang: ?string): { [string]: Question } {
  return flatMap(template.questions, question => {
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
}

/**
 * Converts a report into a form where irrelevant information and languages are stripped
 */
export function mapFormToAnsweredQuestions(
  answers: Array<Answer>,
  template: Template,
  deviceLang: ?string
): Array<AnsweredQuestion> {
  const questions: { [string]: Question } = mapFormToQuestions(template, deviceLang);
  return flatMap((answers: Array<Answer>), (answer: Answer) => {
    const question = questions[answer.questionName];
    const answeredQuestion: AnsweredQuestion = {
      question,
      answer: getAnswerValues(question, answer)
    };

    const childMatchCondition =
      question.type === 'audio'
        ? true
        : question.childQuestion && answer.value === question.childQuestion.conditionalValue;
    if (!!answer.child && childMatchCondition) {
      const questionName = answer.child.questionName;
      const childQuestion = questions[questionName];
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

/**
 * Creates and returns an array of structured metadata relating to the provided report
 *
 * The metadata returned by this method
 *
 * @param report
 * @param language
 *  A language to include as a metadata field. This is not used to localise any of the returned metadata.
 * @return {*}
 *  An array of objects, with each object having a unique id, a human-readable label, and an array of values
 */
export function mapReportToMetadata(report: Report, language: string): Array<Metadata> {
  if (!report) {
    return [];
  }

  const {
    area: { dataset = {} } // TODO: we have datasets, but not dataset
  } = report;
  const reportedPosition =
    report.clickedPosition &&
    JSON.parse(report.clickedPosition).map(pos =>
      [
        pos.lat.toLocaleString(undefined, { maximumFractionDigits: 4 }),
        pos.lon.toLocaleString(undefined, { maximumFractionDigits: 4 })
      ].toString()
    );
  const date = moment(report.date).format('YYYY-MM-DD');
  const userPosition =
    report.userPosition === REPORTS.noGpsPosition ? i18n.t('report.noGpsPosition') : report.userPosition;

  const metadata: Array<Metadata> = [
    { id: 'name', label: i18n.t('commonText.name'), value: [report.reportName] },
    { id: 'areaName', label: i18n.t('commonText.area'), value: [report.area.name] },
    { id: 'date', label: i18n.t('commonText.date'), value: [date] },
    { id: 'language', label: i18n.t('commonText.language'), value: [language] },
    { id: 'userPosition', label: i18n.t('commonText.userPosition'), value: [userPosition] },
    { id: 'clickedPosition', label: i18n.t('commonText.reportedPosition'), value: [reportedPosition] }
  ];

  const readableName = readableNameForReportName(report.reportName, false);
  if (readableName) {
    metadata.push({ id: 'dataset', label: i18n.t('commonText.alert'), value: [readableName] });
  } else if (dataset && dataset.slug) {
    metadata.push({ id: 'dataset', label: i18n.t('commonText.alert'), value: [i18n.t(`datasets.${dataset.slug}`)] });
  }

  return metadata;
}
