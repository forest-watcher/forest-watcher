import Config from 'react-native-config';
import CONSTANTS from 'config/constants';
import moment from 'moment';

export function activeDataset(area) {
  if (area.datasets === undefined) return false;
  const enabledDataset = area.datasets.find((d) => (d.active === true));
  if (typeof enabledDataset !== 'undefined') { return enabledDataset; }
  return false;
}

export function enabledDatasetName(area) {
  if (!area.datasets) return false;
  const enabledDataset = activeDataset(area);
  return enabledDataset !== false ? enabledDataset.name : false;
}

export function getCoverageDataByGeostore(geostoreId, token) {
  const url = `${Config.API_URL}/coverage/intersect?geostore=${geostoreId}`;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return fetch(url, config)
    .then(res => {
      if (res.ok) return res.json();
      throw Error(res.statusText);
    })
    .then(res => (
      res.data.layers || []
    ));
}

export function getInitialDatasets(coverage) {
  const alerts = [
    {
      slug: 'umd_as_it_happens',
      name: 'GLAD',
      active: false,
      startDate: CONSTANTS.startDate,
      endDate: moment().format('YYYYMMDD')
    }
  ];

  const globalAlerts = [
    {
      slug: 'viirs',
      name: 'VIIRS',
      active: false,
      startDate: '1',
      endDate: '8'
    }
  ];
  let datasets = [];
  for (let i = 0, aLength = alerts.length; i < aLength; i++) {
    for (let j = 0, lLength = coverage.length; j < lLength; j++) {
      if (alerts[i].slug === coverage[j]) {
        datasets.push(alerts[i]);
      }
    }
  }

  datasets = datasets.concat(globalAlerts);
  datasets[0].active = true;
  return datasets;
}
