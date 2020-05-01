// To dump Realm db => Realm.clearTestState()

import AlertSchema from 'config/db/schemas';
import Realm from 'realm';

export function initDb(schema = [AlertSchema]) {
  return new Realm({ schema });
}
