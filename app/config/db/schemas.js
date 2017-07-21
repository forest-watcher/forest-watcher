const AlertSchema = {
  name: 'Alert',
  properties: {
    areaId: { type: 'string', indexed: true },
    slug: { type: 'string', indexed: true },
    reported: 'bool',
    long: 'float',
    lat: 'float',
    date: 'int'
  }
};

export default AlertSchema;
