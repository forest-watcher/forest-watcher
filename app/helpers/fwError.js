export default class FWError extends Error {
  constructor({ message = 'Unknown error', ...rest }) {
    super(message);
    Object.keys(rest).forEach(key => {
      this[key] = rest[key];
    });
  }
}
