// @flow

import type { ImportBundleRequest, UnpackedSharingBundle } from 'types/sharing.types';
import { Navigation, type LayoutComponent } from 'react-native-navigation';

/**
 * Describes the state of the custom import flow
 */
export type SharingBundleCustomImportFlowState = {
  bundle: UnpackedSharingBundle,
  numSteps: number,
  currentStep: number,
  steps: Array<LayoutComponent>,
  pushNextStep: (componentId: string, importRequest: ImportBundleRequest) => void
};

/**
 * Inspects the contents of a sharing bundle to decide what screens should appear in the custom import flow.
 *
 * If no custom import flow is needed, then returns null.
 */
export default function createCustomImportFlow(bundle: UnpackedSharingBundle): SharingBundleCustomImportFlowState {
  // First work out which types of items are in the bundle
  const hasAreas = bundle.data.areas.length > 0;
  const hasBasemaps = bundle.data.basemaps.length > 0;
  const hasContextualLayers = bundle.data.layers.length > 0;
  const hasReports = bundle.data.reports.length > 0;
  const hasRoutes = bundle.data.routes.length > 0;

  // Next, work out which screens we should show
  const hasLayers = hasContextualLayers || hasBasemaps;
  const hasAnyRegionItems = hasAreas || hasRoutes;
  const numItemTypes = (hasAreas ? 1 : 0) + (hasReports ? 1 : 0) + (hasRoutes ? 1 : 0);
  const hasAtLeastTwoItemTypes = numItemTypes >= 2;
  const showItemSelect = (hasAnyRegionItems && hasLayers) || hasAtLeastTwoItemTypes;
  const showLayerSelect = hasLayers;
  const showBasemapSelect = (showItemSelect || showLayerSelect) && hasBasemaps;

  const customFlowScreenLayouts: Array<LayoutComponent> = [];

  if (showItemSelect) {
    customFlowScreenLayouts.push({
      name: 'ForestWatcher.ImportBundleCustomItems'
    });
  }

  if (showLayerSelect) {
    customFlowScreenLayouts.push({
      name: 'ForestWatcher.ImportBundleCustomLayers'
    });
  }

  if (showBasemapSelect) {
    customFlowScreenLayouts.push({
      name: 'ForestWatcher.ImportBundleCustomBasemaps'
    });
  }

  customFlowScreenLayouts.push({
    name: 'ForestWatcher.ImportBundleConfirm'
  });

  const formState = {
    bundle: bundle,
    numSteps: customFlowScreenLayouts.length,
    currentStep: 0,
    steps: customFlowScreenLayouts,
    pushNextStep: (componentId, importRequest) =>
      pushNextScreenInCustomImportFlow(formState, componentId, importRequest)
  };

  return formState;
}

/**
 * Push the next screen in the custom flow onto the stack
 */
function pushNextScreenInCustomImportFlow(
  formState: SharingBundleCustomImportFlowState,
  componentId: string,
  importRequest: ImportBundleRequest
) {
  const nextScreen = formState.steps[formState.currentStep];
  const nextFormState: SharingBundleCustomImportFlowState = {
    ...formState,
    currentStep: formState.currentStep + 1,
    pushNextStep: (componentId, importRequest) =>
      pushNextScreenInCustomImportFlow(nextFormState, componentId, importRequest)
  };

  Navigation.push(componentId, {
    component: {
      ...nextScreen,
      passProps: {
        ...(nextScreen.passProps ?? {}),
        formState: nextFormState,
        importRequest: importRequest
      }
    }
  });
}
