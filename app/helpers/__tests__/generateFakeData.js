import _ from 'lodash';

const faker = require('faker');

export const QUESTION_TYPES = ['date', 'number', 'point', 'radio', 'select', 'text', 'blob'];

export function createFakeQuestion(languages, overrides = {}) {
  const type = overrides.type || faker.random.arrayElement(QUESTION_TYPES);
  const childQuestions = overrides.childQuestions || (faker.random.boolean(0.2) ? [createFakeQuestion(languages)] : []); // Only 1 child question currently supported
  const numValues = faker.random.number(10) + 1;
  const values =
    overrides.values ||
    (type === 'radio' || type === 'select' ? createFakeQuestionValues(languages, numValues) : undefined);
  return {
    type: type,
    name: faker.lorem.slug(),
    Id: faker.random.uuid(),
    conditions: [],
    childQuestions: childQuestions,
    values: values,
    defaultValue: '',
    order: 0,
    required: faker.random.boolean(),
    label: _.zipObject(languages, languages.map(() => faker.lorem.sentence())),
    ...overrides
  };
}

export function createFakeLanguages(num = faker.random.number(4) + 1) {
  return _.range(faker.random.number(4) + 1).map(idx => faker.random.locale());
}

export function createFakeQuestionValues(languages, numValues) {
  return _.zipObject(
    languages,
    languages.map(language =>
      _.range(0, numValues).map(idx => ({
        value: idx,
        label: faker.lorem.words()
      }))
    )
  );
}

export function createFakeTemplate(overrides = {}) {
  const languages = overrides.languages || createFakeLanguages();
  const answersCount = overrides.answersCount || faker.random.number(10) + 1;
  const questions =
    overrides.questions ||
    _.range(answersCount).map(idx =>
      createFakeQuestion(languages, {
        order: idx
      })
    );
  return {
    id: faker.random.uuid(),
    name: _.zipObject(languages, languages.map(() => faker.lorem.sentence())),
    languages: languages,
    defaultLanguage: faker.random.arrayElement(languages),
    user: faker.random.uuid(),
    createdAt: faker.date.past(),
    status: faker.random.arrayElement(['published', 'unpublished']),
    answersCount: questions.length,
    questions: questions,
    public: faker.random.boolean(),
    ...overrides
  };
}

export function createFakeReport(template, overrides = {}) {
  return {
    reportName: faker.random.uuid(),
    area: {
      templateId: template.Id
    },
    userPosition: `${faker.address.latitude()},${faker.address.longitude()}`,
    clickedPosition: [
      {
        lat: faker.address.latitude(),
        lng: faker.address.longitude()
      }
    ],
    index: 0,
    status: faker.random.arrayElement(['draft', 'complete', 'uploaded']),
    date: faker.date.past(),
    answers: createFakeAnswers(template),
    ...overrides
  };
}

export function createFakeAnswers(template) {
  return template.questions.map(question => createFakeAnswer(question));
}

export function createFakeAnswer(question) {
  let value = createFakeAnswerValue(question);

  return {
    questionName: question.name,
    value: value,
    child: question.childQuestion ? createFakeAnswer(question.childQuestion) : null
  };
}

export function createFakeAnswerValue(question) {
  switch (question.type) {
    case 'date':
      return faker.date.past();
    case 'number':
      return faker.random.number(1000);
    case 'point':
      return `${faker.random.latitude},${faker.random.longitude}`;
    case 'radio':
      console.log('3SC', 'reports', JSON.stringify(question));
      return faker.random.arrayElement(Object.values(question.values)[0]).value;
    case 'select':
      return Object.values(question.values)[0]
        .filter(() => faker.random.boolean())
        .map(value => value.value);
    case 'text': {
      return faker.lorem.paragraphs();
    }
    case 'blob':
      return '';
  }

  return null;
}
