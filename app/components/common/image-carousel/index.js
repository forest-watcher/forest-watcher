import React from 'react';
import PropTypes from 'prop-types';
import Theme from 'config/theme';
import Carousel from 'react-native-snap-carousel';
import ImageCard from 'components/common/image-card';


const ImageCarousel = (props) => {
  const { actions, images, itemWidth, itemHeight } = props;
  return (
    <Carousel
      sliderWidth={Theme.screen.width}
      itemWidth={itemWidth}
    >
      {
        images.map(image => (
          <ImageCard
            id={image.id}
            key={image.id}
            actions={actions}
            uri={image.uri}
            width={itemWidth}
            height={itemHeight}
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
  itemWidth: PropTypes.number
};

ImageCarousel.defaultProps = {
  itemHeight: 88,
  itemWidth: 128
};

export default ImageCarousel;
