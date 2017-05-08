import { connect } from 'react-redux';
import SetupOverview from 'components/setup/overview';
import { saveArea } from 'redux-modules/areas';
import { getBboxTiles, cacheTiles } from 'helpers/map';
import BoundingBox from 'boundingbox';
import CONSTANTS from 'config/constants';

async function downloadArea(bbox, areaName) {
  const zooms = CONSTANTS.maps.cachedZoomLevels;
  const tilesArray = getBboxTiles(bbox, zooms);
  await cacheTiles(tilesArray, areaName);
}

function mapStateToProps(state) {
  return {
    area: state.setup.area,
    snapshot: state.setup.snapshot,
    geojson: state.geostore.data[state.setup.area.geostore],
    user: {
      id: state.user.data.id,
      token: state.user.token
    },
    areaSaved: state.setup.areaSaved
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveArea: async (action) => {
      const bboxArea = new BoundingBox(action.area.geojson.features[0]);
      if (bboxArea) {
        const bbox = [
          { lat: bboxArea.minlat, lng: bboxArea.maxlon },
          { lat: bboxArea.maxlat, lng: bboxArea.minlon }
        ];
        await downloadArea(bbox, action.area.name);
      }
      dispatch(saveArea(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
