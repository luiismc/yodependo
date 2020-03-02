import React from 'react';
import {Dimensions} from 'react-native';
import { withNavigation} from 'react-navigation';
import SlideshowBasic from './Basic';
import SlideshowCreative from './Creative';

import { mainStack, blogStack } from 'src/config/navigator';

const {width} = Dimensions.get('window');

class Slideshow extends React.Component {
  clickGoPage = (action) => {
    if (action && action.type && action.id) {
      const { type, id} = action;
      const router = type === 'category'
        ? mainStack.products
        : type === 'blog'
          ? blogStack.blog_detail
          : mainStack.product;
      this.props.navigation.navigate(router, {id, type})
    }
  };

  render() {
    const { layout, fields, widthComponent } = this.props;

    if (!fields || typeof fields !== 'object' || Object.keys(fields).length < 1) {
      return null;
    }
    if (layout === 'creative') {
      return <SlideshowCreative fields={fields} widthComponent={widthComponent} clickGoPage={this.clickGoPage}/>;
    }

    return <SlideshowBasic fields={fields} widthComponent={widthComponent} clickGoPage={this.clickGoPage} />;
  }
}

Slideshow.defaultProps = {
  widthComponent: width
};
export default withNavigation(Slideshow);
