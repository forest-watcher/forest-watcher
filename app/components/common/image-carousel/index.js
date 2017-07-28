import React from 'react';
import PropTypes from 'prop-types';
import Theme from 'config/theme';
import Carousel from 'react-native-snap-carousel';
import ImageCard from 'components/common/image-card';
import ActionCard from 'components/common/action-card';
import I18n from 'locales';

const plusIcon = require('assets/plus.png');

const ImageCarousel = (props) => {
  const { actions, images, itemWidth, itemHeight, add, readOnly } = props;
  const label = readOnly ? I18n.t('report.emptyPicture') : I18n.t('report.addPicture');
  const icon = !readOnly && plusIcon;
  const getAction = (image) => {
    if (!readOnly) return () => add(image.questionNumber);
    return undefined;
  };
  return (
    <Carousel
      sliderWidth={Theme.screen.width}
      itemWidth={itemWidth}
    >
      {
        images.map(image => (
          image.uri ?
            <ImageCard
              id={image.id}
              name={image.name}
              key={image.id}
              actions={actions}
              uri={image.uri}
              width={itemWidth}
              height={itemHeight}
            /> :
            <ActionCard
              key={image.id}
              label={label}
              width={itemWidth}
              height={itemHeight}
              icon={icon}
              action={getAction(image)}
            />
        ))
      }
    </Carousel>
  );
};

ImageCarousel.propTypes = {
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

ImageCarousel.defaultProps = {
  itemHeight: 136,
  itemWidth: 128
};

export default ImageCarousel;
