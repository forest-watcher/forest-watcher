// @flow
import type { Area, Dataset } from 'types/areas.types';
import { Alert } from 'react-native';
import i18n from 'i18next';

export function getSelectedArea(areas: Array<Area>, selectedId: string): ?Area {
  if (!selectedId || (!areas || !areas.length)) {
    return null;
  }
  return areas.find(a => a.id === selectedId);
}

export function activeDataset(area: Area): ?Dataset {
  if (!area?.datasets) {
    return null;
  }
  const enabledDataset = area.datasets.find(Boolean);
  return enabledDataset;
}

export function showNoGeostoreIDPrompt() {
  Alert.alert(
    i18n.t('routes.downloading.noGeostoreIDError.title'),
    i18n.t('routes.downloading.noGeostoreIDError.message'),
    [
      {
        text: i18n.t('commonText.cancel'),
        style: 'cancel'
      }
    ]
  );
}
