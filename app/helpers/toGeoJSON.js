// @flow

import * as topojson from "topojson-client";
const togeojson = require('@tmcw/togeojson');

/**
 * Converts topojson to GeoJSON
 *
 * @param {Object} topojson - The topojson to convert to geojson
 * @param {string} topojson.type - The topojson type string
 * @param {Object} topojson.objects - The topojson objects
 *
 * @returns {Object} A valid GeoJSON object, as a `FeatureCollection`
 */
function convertTopoJSON(topojson) {
	let features = [];
	Object.keys(topojson.objects).forEach(objectKey => {
		const feature = topojson.feature(topojson, objectKey);
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