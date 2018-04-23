// @flow

export type Answers = { [string]: number | string | Array<number> };
export type FormState = {
  [string]: {
    registeredFields: {
      [string]: {
        name: string,
        type: string,
        count: number
      }
    },
    values: Answers
  }
};
