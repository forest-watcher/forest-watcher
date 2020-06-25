// @flow

import _ from 'lodash';

type ObjectOrArray = Object | Array<any>;

/**
 * Removes null or undefined recursively from an object or array
 *
 * @param {Object|Array} obj The object to remove nulls from
 */
export function removeNulls(obj: ObjectOrArray): ObjectOrArray {
  return (function prune(current) {
    _.forOwn(current, function(value, key) {
      if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value)) {
        delete current[key];
      }
      if (_.isObject(value)) prune(value);
    });

    // remove any leftover undefined values from the delete
    // operation on an array
    if (_.isArray(current)) _.pull(current, undefined);
    return current;
  })(_.cloneDeep(obj)); // Do not modify the original object, create a clone instead
}

/**
 * Returns whether the object is "deep" empty, recursively
 *
 * @param {Object|Array} obj The object to check if empty
 */
export function isEmpty(obj: ObjectOrArray): ObjectOrArray {
  if (_.isObject(obj)) {
    // $FlowFixMe
    if (Object.keys(obj).length === 0) return true;
    return _.every(_.map(obj, v => isEmpty(v)));
  } else if (_.isString(obj)) {
    return !obj.length;
  }
  return _.isNull(obj) || _.isUndefined(obj) || _.isNaN(obj);
}
