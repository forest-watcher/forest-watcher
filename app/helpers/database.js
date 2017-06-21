// To dump Realm db => Realm.clearTestState()

const Realm = require('realm');

const schema = {
  schema: [
    { name: 'Alert',
      properties: {
        areaId: { type: 'string', indexed: true },
        slug: { type: 'string', indexed: true },
        long: 'float',
        lat: 'float',
        date: 'int'
      }
    }
  ]
};

export function initDb() {
  return new Realm(schema);
}

// realm objects are lazy loaded by default. Not easy to debug
export function read(realm, object, eager = false) {
  return eager ? Array.from(realm.objects(object)) : realm.objects(object);
}

export function write(realm, object, data) {
  realm.write(() => {
    realm.create(object, data);
  });
}
