import React from 'react';
import PropTypes from 'prop-types';
import Theme from 'config/theme';
import Carousel from 'react-native-snap-carousel';
import ImageCard from 'components/common/image-card';
import ActionCard from 'components/common/action-card';

const plusIcon = require('assets/plus.png');

const ImageCarousel = (props) => {
  const { actions, images, itemWidth, itemHeight, add } = props;
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
              label="Add Picture"
              width={itemWidth}
              height={itemHeight}
              icon={plusIcon}
              action={() => add(image.questionNumber)}
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
  add: PropTypes.func
};

ImageCarousel.defaultProps = {
  itemHeight: 136,
  itemWidth: 128
};

export default ImageCarousel;
