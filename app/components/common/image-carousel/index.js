import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Theme from 'config/theme';
import Carousel from 'react-native-snap-carousel';
import ImageCard from 'components/common/image-card';
import ActionCard from 'components/common/action-card';
import i18n from 'locales';

const plusIcon = require('assets/plus.png');

class ImageCarousel extends PureComponent {
  static propTypes = {
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        callback: PropTypes.func,
        icon: PropTypes.any
      })
    ),
    images: PropTypes.array,
    itemHeight: PropTypes.number,
    itemWidth: PropTypes.number,
    add: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    itemHeight: 136,
    itemWidth: 128
  };

  renderItem = ({ item }) => {
    const { actions, itemHeight, add, readOnly, itemWidth } = this.props;
    const label = readOnly ? i18n.t('report.emptyPicture') : i18n.t('report.addPicture');
    const icon = !readOnly && plusIcon;
    const getAction = image => {
      if (!readOnly) return () => add(image.questionNumber);
      return undefined;
    };

    return item.uri ? (
      <ImageCard
        id={item.id}
        name={item.name}
        key={item.id}
        actions={actions}
        uri={item.uri}
        width={itemWidth}
        height={itemHeight}
      />
    ) : (
      <ActionCard
        key={item.id}
        label={label}
        width={itemWidth}
        height={itemHeight}
        icon={icon}
        action={getAction(item)}
      />
    );
  };

  render() {
    const { images, itemWidth } = this.props;

    return (
      <Carousel
        renderItem={this.renderItem}
        showsHorizontalScrollIndicator={false}
        sliderWidth={Theme.screen.width}
        itemWidth={itemWidth}
        data={images}
      />
    );
  }
}

export default ImageCarousel;
