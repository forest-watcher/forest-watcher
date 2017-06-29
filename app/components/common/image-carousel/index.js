import React from 'react';
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
  actions: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      callback: React.PropTypes.func,
      icon: React.PropTypes.any
    })
  ),
  images: React.PropTypes.array,
  itemHeight: React.PropTypes.number,
  itemWidth: React.PropTypes.number
};

ImageCarousel.defaultProps = {
  itemHeight: 88,
  itemWidth: 128
};

export default ImageCarousel;
