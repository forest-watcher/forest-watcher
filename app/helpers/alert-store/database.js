// To dump Realm db => Realm.clearTestState()

import Realm from 'realm';

const AlertSchema = {
  name: 'Alert',
  properties: {
    areaId: { type: 'string', indexed: true },
    slug: { type: 'string', indexed: true },
    long: 'float',
    lat: 'float',
    date: 'int'
  }
};

export function initDb(schema = [AlertSchema]) {
  return new Realm({ schema });
}
