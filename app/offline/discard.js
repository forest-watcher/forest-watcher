/**
 * Modification of the default redux-offline discard implementation, that will also discard after server 500+ errors.
 *
 * @param error
 * @param action
 * @param retries
 * @return {boolean}  True if the action should be discarded, false otherwise
 */
export default (error, action, retries) => {
  const status = error?.status || 0;
  return status >= 400;
};
