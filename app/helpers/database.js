const Realm = require('realm');

const schema = {
  schema: [
    { name: 'Alert',
      properties: {
        slug: 'string',
        long: 'float',
        lat: 'float'
      }
    }
  ]
};

export function initDb() {
  return new Realm(schema);
}

export function read(realm, object, eager = false) {
  return eager ? Array.from(realm.objects(object)) : realm.objects(object);
}

export function write(realm, object, data) {
  realm.write(() => {
    realm.create(object, data);
  });
}
