import {
  createFakeLanguages,
  createFakeQuestion,
  createFakeReport,
  createFakeTemplate,
  QUESTION_TYPES
} from '../__mocks__/generateFakeData';
import { mapFormToAnsweredQuestions, mapFormToQuestions, parseQuestion } from '../forms';

const faker = require('faker');

describe('form helper functions', () => {
  //it('renders single report to CSV', () => {
  //  const template = createFakeTemplate();
  //});

  it('mapFormToAnsweredQuestions works with text input', () => {
    const languages = createFakeLanguages();
    const question = createFakeQuestion(languages, { childQuestions: [], type: 'text' });
    const template = createFakeTemplate({ languages, questions: [question] });
    const deviceLang = faker.random.arrayElement(languages);
    const inputtedText = 'test test';
    const report = createFakeReport(template, deviceLang, {
      answers: [
        {
          questionName: question.name,
          value: inputtedText,
          child: null
        }
      ]
    });
    const mapped = mapFormToAnsweredQuestions(report.answers, template, deviceLang);
    expect(mapped).toEqual([
      {
        question: mapFormToQuestions(template, deviceLang)[question.name],
        answer: { ...report.answers[0], value: [inputtedText] }
      }
    ]);
  });

  it('mapFormToAnsweredQuestions works with radio input', () => {
    const languages = createFakeLanguages();
    const question = createFakeQuestion(languages, { childQuestions: [], type: 'radio' });
    const template = createFakeTemplate({ languages, questions: [question] });
    const deviceLang = faker.random.arrayElement(languages);
    const selectedAnswer = 1;
    const report = createFakeReport(template, deviceLang, {
      answers: [
        {
          questionName: question.name,
          value: [selectedAnswer],
          child: null
        }
      ]
    });
    const mapped = mapFormToAnsweredQuestions(report.answers, template, deviceLang);
    expect(mapped).toEqual([
      {
        question: mapFormToQuestions(template, deviceLang)[question.name],
        answer: { ...report.answers[0], value: [question.values[deviceLang][selectedAnswer].label] }
      }
    ]);
  });

  it('mapFormToAnsweredQuestions works with checkbox input', () => {
    const languages = createFakeLanguages();
    const question = createFakeQuestion(languages, { childQuestions: [], type: 'select' });
    const template = createFakeTemplate({ languages, questions: [question] });
    const deviceLang = faker.random.arrayElement(languages);
    const selectedAnswers = [0, 1];
    const report = createFakeReport(template, deviceLang, {
      answers: [
        {
          questionName: question.name,
          value: selectedAnswers,
          child: null
        }
      ]
    });
    const mapped = mapFormToAnsweredQuestions(report.answers, template, deviceLang);
    expect(mapped).toEqual([
      {
        question: mapFormToQuestions(template, deviceLang)[question.name],
        answer: {
          ...report.answers[0],
          value: selectedAnswers.map(answer => question.values[deviceLang][answer].label)
        }
      }
    ]);
  });

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
