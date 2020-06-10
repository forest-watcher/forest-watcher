// @flow

import type { ElementConfig } from 'react';
import { Text, View } from 'react-native';

// Defines the style prop type for the View component.
export type ViewProps = ElementConfig<typeof View>;
export type ViewStyle = $PropertyType<ViewProps, 'style'>;

// Defines the style prop type for the Text component.
export type TextProps = ElementConfig<typeof Text>;
export type TextStyle = $PropertyType<TextProps, 'style'>;
