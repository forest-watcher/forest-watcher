import { createFakeLanguages, createFakeQuestion, createFakeTemplate, QUESTION_TYPES } from './generateFakeData';
import { mapFormToQuestions, parseQuestion } from '../forms';

const faker = require('faker');

describe('form helper functions', () => {
  //it('renders single report to CSV', () => {
  //  const template = createFakeTemplate();
  //});

  it('mapFormToQuestions works with each question type', () => {
    const languages = createFakeLanguages();

    QUESTION_TYPES.forEach(type => {
      const question = createFakeQuestion(languages, { childQuestions: [], type });
      const template = createFakeTemplate({ languages, questions: [question] });
      const deviceLang = faker.random.arrayElement(languages);
      const mapped = mapFormToQuestions(template, deviceLang);
      expect(Object.keys(mapped)).toEqual([question.name]);
      expect(Object.values(mapped)).toEqual([
        {
          ...question,
          label: question.label[deviceLang],
          values: question.values?.[deviceLang] || undefined
        }
      ]);
    });
  });

  it('mapFormToQuestions processes child questions', () => {
    const languages = createFakeLanguages();

    QUESTION_TYPES.forEach(type => {
      const childQuestion = createFakeQuestion(languages, { childQuestions: [], type });
      const question = createFakeQuestion(languages, { childQuestions: [childQuestion], type });
      const template = createFakeTemplate({ languages, questions: [question] });
      const deviceLang = faker.random.arrayElement(languages);
      const mapped = mapFormToQuestions(template, deviceLang);
      expect(Object.keys(mapped)).toEqual([question.name, childQuestion.name]);
      expect(Object.values(mapped)[0]).toEqual({
        ...question,
        label: question.label[deviceLang],
        values: question.values?.[deviceLang] || undefined,
        childQuestion: {
          ...childQuestion,
          label: childQuestion.label[deviceLang],
          values: childQuestion.values?.[deviceLang] || undefined
        }
      });
      expect(Object.values(mapped)[1]).toEqual({
        ...childQuestion,
        label: childQuestion.label[deviceLang],
        values: childQuestion.values?.[deviceLang] || undefined
      });
    });
  });

  it('parseQuestion works with each question type', () => {
    const languages = createFakeLanguages();

    QUESTION_TYPES.forEach(type => {
      const question = createFakeQuestion(languages, { childQuestions: [], type });
      const template = createFakeTemplate({ languages, questions: [question] });
      const deviceLang = faker.random.arrayElement(languages);
      const parsed = parseQuestion(
        {
          question,
          template
        },
        deviceLang
      );
      expect(parsed).toEqual({
        ...question,
        label: question.label[deviceLang],
        values: question.values?.[deviceLang] || undefined
      });
    });
  });

  it('parseQuestion works with child questions', () => {
    const languages = createFakeLanguages();

    QUESTION_TYPES.forEach(type => {
      const childQuestion = createFakeQuestion(languages, { childQuestions: [], type });
      const question = createFakeQuestion(languages, { childQuestions: [childQuestion], type });
      const template = createFakeTemplate({ languages, questions: [question] });
      const deviceLang = faker.random.arrayElement(languages);
      const parsed = parseQuestion(
        {
          question,
          template
        },
        deviceLang
      );
      expect(parsed).toEqual({
        ...question,
        label: question.label[deviceLang],
        values: question.values?.[deviceLang] || undefined,
        childQuestion: {
          ...childQuestion,
          label: childQuestion.label[deviceLang],
          values: childQuestion.values?.[deviceLang] || undefined
        }
      });
    });
  });
});
