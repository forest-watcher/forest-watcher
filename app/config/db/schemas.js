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

export default AlertSchema;
