// To dump Realm db => Realm.clearTestState()

import AlertSchema from 'config/db/schemas';

const Realm = require('realm');

export function initDb(schema = [AlertSchema]) {
  return new Realm({ schema });
}

export function read(realm, object, eager = false) {
  return eager ? Array.from(realm.objects(object)) : realm.objects(object);
}

export function write(realm, object, data) {
  realm.write(() => {
    realm.create(object, data);
  });
}
