// @flow
import moment from 'moment';
import memoize from 'lodash/memoize';
import supercluster from 'supercluster';
import { DATASETS } from 'config/constants';
import { initDb, read } from 'helpers/database';
import { pointsToGeoJSON } from 'helpers/map';

memoize.Cache = Map;

type Marker = { geometry: { coordinates: [number, number] } };
type Clusters = {
  getClusters: (boundingBox: [number, number, number, number], zoom: number) => Array<Marker>,
  alertsId: string
};

class ClustersGenerator {
  static createCluster(data: { features: Object }): Clusters {
    const cluster = supercluster({
      radius: 120,
      maxZoom: 15, // Default: 16,
      nodeSize: 128
    });
    cluster.load(data.features);
    return cluster;
  }

  clusters: ?Clusters = null;
  activeClusterId: ?number = null;

  mapAreaToClusters = memoize((areaId: string, slug: string, startDate: number) => {
    const realm = initDb();
    // TODO: use days in both systems
    const timeFrame = slug === DATASETS.VIIRS ? 'day' : 'month';
    const limitRange = moment().subtract(startDate, timeFrame).valueOf();
    const alerts = read(realm, 'Alert')
      .filtered(`areaId = '${areaId}' AND slug = '${slug}' AND date > '${limitRange}'`);
    const activeAlerts = pointsToGeoJSON(alerts);
    return ClustersGenerator.createCluster(activeAlerts);
  }, (...rest) => rest.join('_'));

  update(...options: *) {
    this.clusters = this.mapAreaToClusters(...options);
    this.activeClusterId = Date.now();
    if (this.mapAreaToClusters.cache.size > 3) {
      const first = this.mapAreaToClusters.cache.keys().next().value;
      this.mapAreaToClusters.cache.delete(first);
    }
  }

  clear() {
    this.mapAreaToClusters.cache.clear();
  }
}

export default new ClustersGenerator();
