// @flow

import type { ElementConfig } from 'react';
import { View } from 'react-native';

// Defines the style prop type for the View component.
export type ViewProps = ElementConfig<typeof View>;
export type ViewStyle = $PropertyType<ViewProps, 'style'>;
