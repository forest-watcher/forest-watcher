// @flow
import type { ImportBundleRequest, LayerFileImportStrategy, SharingBundle } from 'types/sharing.types';
import React, { type Node } from 'react';
import i18n from 'i18next';

import Dropdown from 'components/common/dropdown';
import { formatBytes } from 'helpers/data';
import { filterRelevantLayerFiles } from 'helpers/sharing/importFileManifest';
import { manifestBundleSize } from 'helpers/sharing/calculateBundleSize';

import styles from './styles';

type Props = {
  bundle: SharingBundle,
  layerType: 'customBasemaps' | 'customContextualLayers' | 'gfwContextualLayers',
  onValueChange: LayerFileImportStrategy => any,
  request: ImportBundleRequest
};

export default function CustomLayerScopeDropdown(props: Props): Node {
  const { bundle, layerType, onValueChange, request } = props;

  const selectedValue = request[layerType].files;

  // Set all other layer types to unrequested, apart from the one we are interested in, so that we can see
  // the layer files needed just for this type
  const allFilesRequest: ImportBundleRequest = {
    ...request,
    customBasemaps: {
      metadata: false,
      files: 'all'
    },
    customContextualLayers: {
      metadata: false,
      files: 'all'
    },
    gfwContextualLayers: {
      metadata: false,
      files: 'all'
    },
    [layerType]: {
      metadata: true,
      files: 'all'
    }
  };
  const selectedFilesRequest: ImportBundleRequest = {
    ...allFilesRequest,
    [layerType]: {
      metadata: true,
      files: 'intersecting'
    }
  };

  const allLayerFiles = filterRelevantLayerFiles(bundle, allFilesRequest);
  const selectedLayerFiles = filterRelevantLayerFiles(bundle, selectedFilesRequest);
  const areAllLayerFilesSelected = allLayerFiles.length === selectedLayerFiles.length;

  if (allLayerFiles.length === 0 || selectedLayerFiles.length === 0 || areAllLayerFilesSelected) {
    return null;
  }

  const allLayerFilesSize = manifestBundleSize({
    layerFiles: allLayerFiles,
    reportFiles: []
  });
  const selectedLayerFilesSize = manifestBundleSize({
    layerFiles: selectedLayerFiles,
    reportFiles: []
  });
  const allLayerFilesLabel = `${i18n.t('importBundle.customLayers.fileImportOptionAll')} - ${formatBytes(
    allLayerFilesSize
  )}`;
  const selectedLayerFilesLabel = `${i18n.t('importBundle.customLayers.fileImportOptionSelected')} - ${formatBytes(
    selectedLayerFilesSize
  )}`;

  const isEnabled = request[layerType].metadata;

  return (
    <Dropdown
      label={i18n.t('importBundle.customLayers.fileImportOptionTitle')}
      labelStyle={styles.label}
      description={i18n.t('importBundle.customLayers.fileImportOptionDescription')}
      options={[
        {
          label: allLayerFilesLabel,
          labelKey: '',
          value: 'all'
        },
        {
          label: selectedLayerFilesLabel,
          labelKey: '',
          value: 'intersecting'
        }
      ]}
      selectedValue={selectedValue}
      onValueChange={value => onValueChange(value === 'all' ? value : 'intersecting')}
      hideLabel={true}
      inactive={!isEnabled}
    />
  );
}
