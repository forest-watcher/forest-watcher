// @flow

import type { ImportBundleRequest, SharingBundle } from 'types/sharing.types';

import i18n from 'i18next';
import { isCustomContextualLayer, isGfwContextualLayer } from 'helpers/layerTypes';

/**
 * Describes the contents of an imported bundle by listing the amount and type of each imported item.
 *
 * Returns an array with each entry corresponding to a single imported item, e.g. "481 Alerts"
 */
export default function summariseBundleContents(
  bundle: SharingBundle,
  importRequest: ImportBundleRequest
): Array<string> {
  return [
    summariseItem(importRequest.areas ? bundle.areas : [], i18n.t('sharing.type.area'), i18n.t('sharing.type.areas')),
    summariseItem(
      importRequest.areas ? bundle.alerts : [],
      i18n.t('sharing.type.alert'),
      i18n.t('sharing.type.alerts')
    ),
    summariseItem(
      importRequest.customBasemaps ? bundle.basemaps : [],
      i18n.t('sharing.type.customBasemap'),
      i18n.t('sharing.type.customBasemaps')
    ),
    summariseItem(
      importRequest.customContextualLayers.metadata ? bundle.layers.filter(isCustomContextualLayer) : [],
      i18n.t('sharing.type.customLayer'),
      i18n.t('sharing.type.customLayers')
    ),
    summariseItem(
      importRequest.gfwContextualLayers.metadata ? bundle.layers.filter(isGfwContextualLayer) : [],
      i18n.t('sharing.type.gfwLayer'),
      i18n.t('sharing.type.gfwLayers')
    ),
    summariseItem(
      importRequest.reports ? bundle.reports : [],
      i18n.t('sharing.type.report'),
      i18n.t('sharing.type.reports')
    ),
    summariseItem(
      importRequest.routes ? bundle.routes : [],
      i18n.t('sharing.type.route'),
      i18n.t('sharing.type.routes')
    )
  ].filter(Boolean);
}

function summariseItem(items: Array<any>, singularText: string, pluralText: string): ?string {
  if (items.length === 1) {
    return `${items.length} ${singularText}`;
  } else if (items.length > 1) {
    return `${items.length} ${pluralText}`;
  }

  return null;
}
