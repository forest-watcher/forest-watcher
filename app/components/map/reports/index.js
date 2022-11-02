// @flow
import type { MapboxFeaturePressEvent, ReportFeatureProperties } from 'types/common.types';
import type { Report, SelectedReport } from 'types/reports.types';

import React, { Component } from 'react';

import { View } from 'react-native';
import Theme from 'config/theme';
import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import i18n from 'i18next';
import moment from 'moment';
import { type Feature, type Point, featureCollection, point } from '@turf/helpers';
import { type IconSize, MAP_DEFAULT_ICON_SIZE, MAP_LAYER_INDEXES } from 'config/constants';
import { datasetsForReportName } from 'helpers/reports';

import _ from 'lodash';

export type ReportLayerSettings = {
  layerIsActive: boolean,
  myReportsActive: boolean,
  importedReportsActive: boolean
};

type Props = {
  myReports: $ReadOnlyArray<Report>,
  importedReports: $ReadOnlyArray<Report>,
  selectedReports: $ReadOnlyArray<SelectedReport>,
  reportLayerSettings: ReportLayerSettings,
  onShapeSourcePressed?: (MapboxFeaturePressEvent<ReportFeatureProperties>) => void
};

export default class Reports extends Component<Props> {
  getReportIcon: (isImported: boolean, isSelected: boolean) => any = (isImported: boolean, isSelected: boolean) => {
    let iconName = isImported ? 'importedReport' : 'report';
    if (isSelected) {
      iconName += 'Selected';
    }
    return iconName;
  };

  getReportIconSize: (report: Report) => IconSize = (report: Report): IconSize => {
    const datasets = datasetsForReportName(report.reportName);
    if (!datasets || datasets.length === 0) {
      return MAP_DEFAULT_ICON_SIZE;
    }
    // Get unique icon sizes from the selected datasets
    const sizes = _.uniqWith(
      datasets.map(dataset => {
        return {
          minIconSize: dataset.minIconSize,
          maxIconSize: dataset.maxIconSize
        };
      }),
      _.isEqual
    );

    // If more than one different size then return default
    // as we can't be sure which to render as!
    if (sizes.length > 1) {
      return MAP_DEFAULT_ICON_SIZE;
    }

    return sizes[0];
  };

  getProperties: (options: any) => ReportFeatureProperties = ({
    selected,
    report,
    position,
    minIconSize,
    maxIconSize
  }: {
    selected: boolean,
    report: Report,
    position: { lat: number, lon: number },
    minIconSize: number,
    maxIconSize: number
  }) => {
    return {
      selected,
      icon: this.getReportIcon(!!report.isImported, selected),
      date: moment(report.date),
      type: 'report',
      minIconSize,
      maxIconSize,
      name: i18n.t('map.layerSettings.report'),
      imported: report.isImported ?? false,
      // need to pass these as strings as they are rounded in onShapeSourcePressed method.
      lat: '' + position.lat,
      long: '' + position.lon,
      featureId: report.reportName,
      reportAreaName: report.area.name
    };
  };

  getPoints: (report: Report) => Array<Feature<Point, ReportFeatureProperties>> = (
    report: Report
  ): Array<Feature<Point, ReportFeatureProperties>> => {
    const selected =
      this.props.selectedReports?.length > 0 &&
      !!this.props.selectedReports.find(rep => rep.reportName === report.reportName);
    const { minIconSize, maxIconSize } = this.getReportIconSize(report);
    const clickedPositions = JSON.parse(report.clickedPosition);
    if (clickedPositions.length > 0) {
      return clickedPositions.map(position => {
        const properties: ReportFeatureProperties = this.getProperties({
          selected,
          report,
          position,
          minIconSize,
          maxIconSize
        });
        return point([position.lon, position.lat], properties);
      });
    } else {
      const userPosition = report.userPosition.split(',');
      const position = {
        lat: Number(userPosition[0]),
        lon: Number(userPosition[1])
      };
      const properties = this.getProperties({
        selected,
        report,
        position,
        minIconSize,
        maxIconSize
      });
      return [point([position.lon, position.lat], properties)];
    }
  };

  renderReports: (reports: $ReadOnlyArray<Report>, imported: boolean) => any = (
    reports: $ReadOnlyArray<Report>,
    imported: boolean
  ) => {
    if (!reports?.length) {
      return null;
    }
    const points = [];
    reports.forEach(report => points.push(...this.getPoints(report)));
    const reportFeatureCollection = reports ? featureCollection(points) : null;
    const circleColor = imported ? Theme.colors.importedReport : Theme.colors.report;
    const onPress = this.props.onShapeSourcePressed || null;
    const key = imported ? 'importedReport' : 'myReport';
    return (
      <View>
        <MapboxGL.ShapeSource
          id={key + 'Source'}
          cluster
          clusterRadius={40}
          shape={reportFeatureCollection}
          onPress={onPress}
        >
          <MapboxGL.SymbolLayer
            id={key + 'PointCount'}
            style={mapboxStyles.clusterCount}
            layerIndex={MAP_LAYER_INDEXES.reports}
          />
          <MapboxGL.CircleLayer
            id={key + 'ClusteredPoints'}
            belowLayerID={key + 'PointCount'}
            filter={['has', 'point_count']}
            style={{ ...mapboxStyles.clusteredPoints, circleColor }}
            layerIndex={MAP_LAYER_INDEXES.reports}
          />
          <MapboxGL.SymbolLayer
            id={key + 'Layer'}
            filter={['!', ['has', 'point_count']]}
            style={imported ? mapboxStyles.importedReportIcon : mapboxStyles.reportIcon}
            layerIndex={MAP_LAYER_INDEXES.reports}
          />
        </MapboxGL.ShapeSource>
      </View>
    );
  };

  render(): React$Element<any> | null {
    const { myReportsActive, importedReportsActive, layerIsActive } = this.props.reportLayerSettings;
    if (!layerIsActive) {
      return null;
    }
    return (
      <View>
        <MapboxGL.Images
          images={{
            // Add all images to map so we cn dynamically change the icon for reports
            report: require('assets/alertMapIcons/myReportMapIcon.png'),
            reportSelected: require('assets/alertMapIcons/myReportSelectedMapIcon.png'),
            importedReport: require('assets/alertMapIcons/importedReportMapIcon.png'),
            importedReportSelected: require('assets/alertMapIcons/importedReportSelectedMapIcon.png')
          }}
        />
        {myReportsActive && this.renderReports(this.props.myReports, false)}
        {importedReportsActive && this.renderReports(this.props.importedReports, true)}
      </View>
    );
  }
}
