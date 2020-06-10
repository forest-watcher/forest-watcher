// @flow
import React, { type Node } from 'react';
import { Image, Text, View } from 'react-native';

import styles from './styles';
import Row from 'components/common/row';

const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type Props = {
  titlePlural: string,
  titleSingular: string,
  icon: any,
  iconInactive: any,
  isSelected: boolean,
  callback: () => any,
  items: Array<string>,
  showItemNames: boolean
};

export default function CustomImportItem(props: Props): Node {
  const { titlePlural, titleSingular, icon, iconInactive, isSelected, callback, items, showItemNames } = props;

  const hasItems = items.length > 0;

  let description = `${items.length} ${items.length === 1 ? titleSingular : titlePlural}`;

  if (hasItems && showItemNames) {
    description += `: ${items.join(', ')}`;
  }

  return (
    <Row
      style={styles.rowContent}
      rowStyle={styles.row}
      iconStyle={styles.rowCheckbox}
      action={{
        position: 'top',
        icon: hasItems && isSelected ? checkboxOn : checkboxOff,
        callback: hasItems ? callback : null
      }}
    >
      <Image style={styles.rowIcon} resizeMode={'contain'} source={hasItems ? icon : iconInactive} />
      <View style={styles.rowTextWrapper}>
        <Text style={styles.rowTitle}>{titlePlural}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
    </Row>
  );
}
