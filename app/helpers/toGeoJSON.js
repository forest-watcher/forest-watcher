// @flow

import * as topojson from "topojson-client";
const togeojson = require('@tmcw/togeojson');

/**
 * Converts topojson to GeoJSON
 *
 * @param {Object} json - The topojson to convert to geojson
 * @param {string} json.type - The topojson type string
 * @param {Object} json.objects - The topojson objects
 *
 * @returns {Object} A valid GeoJSON object, as a `FeatureCollection`
 */
function convertTopoJSON(json) {
	let features = [];
	Object.keys(json.objects).forEach(objectKey => {
		const feature = topojson.feature(json, objectKey);
		switch (feature.type) {
			case "Feature": {
				// A `null` geometry object is mapped to a feature with null geometry, but there's no point in having this in GeoJSON
				if (!feature.geometry) {
					break;
				}
				features.push(feature);
				break;
			}
			case "FeatureCollection": {
				const validFeatures = feature.features.filter(feature => {
					// A `null` geometry object is mapped to a feature with null geometry, but there's no point in having this in GeoJSON
					return !!feature.geometry;
				});
				features = features.concat(validFeatures);
				break;
			}
			default:
	        break;
		}
	});
	return {
		type: "FeatureCollection",
		features
	}
}

export default {
	...togeojson,
	topojson: convertTopoJSON
}