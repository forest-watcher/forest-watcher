export default {
  storage: {
    app: {
      setup: '@App:setup',
      tutorial: '@App:tutorial',
      tutorialVersion: '@App:tutorialVersion'
    },
    user: {
      loggedIn: '@User:loggedIn',
      token: '@User:token'
    }
  },
  maps: {
    lat: 27.568640,
    lng: -33.461281,
    bbox: {
      type: 'Polygon',
      coordinates: [
        [
          [-147.65625, -51.8357775204525],
          [-147.65625, 70.959697166864],
          [159.9609375, 70.959697166864],
          [159.9609375, -51.8357775204525],
          [-147.65625, -51.8357775204525]
        ]
      ]
    }
  },
  countries: {
    nameColumn: {
      en: 'name_engli',
      es: 'name_spani',
      fr: 'name_frenc'
    }
  },
  reports: {
    default: 'defaultReport'
  },
  countryLoginTokens: {
    brazilToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4YWRhOGY5YThhMjdlNGU2ZDhiMGJkYSIsInJvbGUiOiJVU0VSIiwicHJvdmlkZXIiOiJsb2NhbCIsImVtYWlsIjoiZ2VyYXJkby5wYWNoZWNvK3VnYW5kYUB2aXp6dWFsaXR5LmNvbSIsImV4dHJhVXNlckRhdGEiOnsiYXBwcyI6WyJydyIsImdmdyIsInByZXAiLCJhcXVlZHVjdCIsImZvcmVzdC1hdGxhcyIsImRhdGE0c2RncyIsImdmdy1jbGltaWF0ZSJdfSwiY3JlYXRlZEF0IjoxNDg3Nzc5MTY1NjkzLCJpYXQiOjE0ODc3NzkxNjV9.BRXITT5a2BW-qzx3dsJ1wu8xJrzYH71p2IJvQJW7B4I',
    indonesiaToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4YWRhOGY4NDAzOGNkNGU4NTY3M2QzOSIsInJvbGUiOiJVU0VSIiwicHJvdmlkZXIiOiJsb2NhbCIsImVtYWlsIjoiZ2VyYXJkby5wYWNoZWNvK2luZG9uZXNpYUB2aXp6dWFsaXR5LmNvbSIsImV4dHJhVXNlckRhdGEiOnsiYXBwcyI6WyJydyIsImdmdyIsInByZXAiLCJhcXVlZHVjdCIsImZvcmVzdC1hdGxhcyIsImRhdGE0c2RncyIsImdmdy1jbGltaWF0ZSJdfSwiY3JlYXRlZEF0IjoxNDg3Nzc5MTExNDQ1LCJpYXQiOjE0ODc3NzkxMTF9.ZbVh55o-cycPsK8n9a0Pk4rRnvZD90_8l-38vNVsCCQ',
    colombiaToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4YWRhOGY2YThhMjdlNGU2ZDhiMGJkNiIsInJvbGUiOiJVU0VSIiwicHJvdmlkZXIiOiJsb2NhbCIsImVtYWlsIjoiZ2VyYXJkby5wYWNoZWNvK2NvbG9tYmlhQHZpenp1YWxpdHkuY29tIiwiZXh0cmFVc2VyRGF0YSI6eyJhcHBzIjpbInJ3IiwiZ2Z3IiwicHJlcCIsImFxdWVkdWN0IiwiZm9yZXN0LWF0bGFzIiwiZGF0YTRzZGdzIiwiZ2Z3LWNsaW1pYXRlIl19LCJjcmVhdGVkQXQiOjE0ODc3NzYwOTc2MDgsImlhdCI6MTQ4Nzc3NjA5N30.I2ArMouwm-BZcNuAriGh4rQamSbliCTbdTcaQnl_AjI'
  }
};
