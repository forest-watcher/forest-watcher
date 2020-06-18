module.exports = {
  options: {
    sort: true,
    removeUnusedKeys: false,
    func: {
      list: ['i18n.t'],
      extensions: ['.js']
    },
    lngs: ['en'],
    defaultValue: 'TRANSLATE_ME',
    resource: {
      loadPath: 'app/locales/{{lng}}.json',
      savePath: 'app/locales/{{lng}}.json',
      jsonIndent: 4
    }
  }
};
