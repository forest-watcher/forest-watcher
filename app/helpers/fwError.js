// @flow

export default class FWError extends Error {
  constructor({ message = 'Unknown error', ...rest }: { message: string }) {
    super(message);
    Object.keys(rest).forEach(key => {
      this[key] = rest[key];
    });
  }
}

export const ERROR_CODES = {
  FILE_TOO_LARGE: "FILE_TOO_LARGE"
};
