import React, {Component} from 'react';

import {compose} from 'recompose';
import {fromJS, List, Map} from 'immutable';
import {connect} from 'react-redux';
import axios from 'axios';

import {showMessage} from 'react-native-flash-message';
import {StyleSheet, View, Dimensions, TouchableOpacity} from 'react-native';
import {Text, ListItem, ThemedView} from 'src/components';
import Price from 'src/containers/Price';
import Container from 'src/containers/Container';
import Rating from 'src/containers/Rating';
import Empty from 'src/containers/Empty';

import ScrollProductDetail from './product/ScrollProductDetail';
import RelatedProducts from './containers/RelatedProducts';
import ProductVariable from './product/ProductVariable';
import ProductExternal from './product/ProductExternal';
import ProductGrouped from './product/ProductGrouped';
import CategoryName from './product/CategoryName';
import ProductImages from './product/ProductImages';
import ProductStock from './product/ProductStock';
import FooterProduct from './product/FooterProduct';

import {addToCart} from 'src/modules/cart/actions';
import {getVariations} from 'src/modules/product/service';
import {
  attributeSelector,
  dataRatingSelector,
} from 'src/modules/product/selectors';
import {
  defaultCurrencySelector,
  currencySelector,
  languageSelector,
  configsSelector,
} from 'src/modules/common/selectors';

import {prepareProductItem} from 'src/utils/product';

import {getSingleData, defaultPropsData} from 'src/hoc/single-data';
import {withLoading} from 'src/hoc/loading';

import {mainStack, homeTabs} from 'src/config/navigator';
import {margin} from 'src/components/config/spacing';
import * as productType from 'src/config/product';

import {handleError} from 'src/utils/error';
import {fetchProductAttributes, fetchRating} from 'src/modules/product/actions';

const {width} = Dimensions.get('window');
const HEADER_MAX_HEIGHT = (width * 440) / 375 + 4;

class Product extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props, context) {
    super(props, context);

    const {navigation, data, currency, defaultCurrency} = props;
    const product = navigation.getParam('product', {});
    // no need get days in prepareProductItem
    const dataPrepare = prepareProductItem(
      fromJS(data),
      currency,
      defaultCurrency,
    );
    const dataProduct = product && product.id ? fromJS(product) : dataPrepare;

    this.state = {
      product: dataProduct,
      images: dataProduct.get('images'),
      loadingVariation: dataProduct.get('type') === productType.VARIABLE, // Loading state fetch product variations
      quantity: 1,
      variation: Map(),
      meta_data: List(),
      variations: List(),
      isAddToCart: false,
    };
  }

  componentDidMount() {
    const {dispatch, attribute, lang} = this.props;
    const {product} = this.state;

    dispatch(fetchRating(product.get('id')));
    // Fetch attribute with product is variation
    if (
      product.get('type') === productType.VARIABLE &&
      !attribute.get('data').size
    ) {
      dispatch(fetchProductAttributes());
    }

    // Fetch variations
    if (product.get('type') === productType.VARIABLE) {
      const CancelToken = axios.CancelToken;
      this.source = CancelToken.source();
      // Get variations
      getVariations(product.get('id'), lang, this.source.token)
        .then(data => {
          this.setState({
            variations: fromJS(data),
            loadingVariation: false,
          });
        })
        .catch(error => {
          if (!axios.isCancel(error)) {
            handleError(error);
            this.setState({
              loadingVariation: false,
            });
            handleError(error);
          }
        });
    }
  }

  componentWillUnmount() {
    if (this.source) {
      this.source.cancel('User exist the screen.');
    }
  }

  addToCart = () => {
    const {product, quantity, variation, meta_data} = this.state;
    const {dispatch} = this.props;
    let check = true;

    // Check select variations
    if (product.get('type') === productType.VARIABLE) {
      const attributes = variation.get('attributes');
      const child = attributes && attributes.size > 0
          ? meta_data.filter(d => {
            const filterSub = attributes.filter(s => s.get('id') === d.get('id') && s.get('option') === d.get('option_name'));
            return filterSub && filterSub.size > 0;
          })
          : null;
      if (!child || child.size !== attributes.size) {
        check = false;
        showMessage({
          message: 'Please select variations',
          type: 'danger',
        });
      }
    }
    if (check) {
      dispatch(
        addToCart({
          product_id: product.get('id'),
          quantity,
          variation,
          product,
          meta_data,
        }, () => this.setState({isAddToCart: true})),
      );
    }
  };

  onChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  images = () => {
    const {product, variation, images} = this.state;
    if (
      product.get('type') === productType.VARIABLE &&
      variation &&
      variation.get('image')
    ) {
      let list = [];
      const image = variation.get('image');
      if (image) {
        list.push(image.toJS());
      }
      return fromJS(list);
    }
    return images;
  };

  showPrice = () => {
    const {currency, defaultCurrency} = this.props;
    const {product, variation} = this.state;

    let price_format = product.get('price_format').toJS();
    let type = product.get('type');

    if (product.get('type') === productType.VARIABLE && variation.get('id')) {
      // no need get days in prepareProductItem
      const value = prepareProductItem(variation, currency, defaultCurrency);
      price_format = value.get('price_format').toJS();
      type = value.get('type')
    }
    return (
      <Price
        price_format={price_format}
        type={type}
        h4
        isPercentSale
        style={styles.viewPrice}
      />
    )
  };

  showStock= () => {
    const {product, variation} = this.state;

    let p = product;
    if (product.get('type') === productType.VARIABLE && variation.get('id')) {
      p = variation
    }
    return (
      <ProductStock
        product={p}
        style={p.get('type') !== productType.SIMPLE && styles.viewStock}
      />
    )
  };

  showInfoType = () => {
    const {attribute} = this.props;
    const {product, meta_data, variations, loadingVariation} = this.state;
    if (product.get('type') === productType.EXTERNAL) {
      return <ProductExternal product={product} />;
    }
    if (product.get('type') === productType.GROUPED) {
      return <ProductGrouped product={product} />;
    }
    if (product.get('type') === productType.VARIABLE) {
      return (
        <ProductVariable
          loading={attribute.get('loading') || loadingVariation}
          meta_data={meta_data}
          productVariations={variations}
          productAttributes={product.get('attributes')}
          onChange={this.onChange}
          attribute={attribute.get('data')}
        />
      );
    }
    return null
  };
  render() {
    const {
      screenProps: {t},
      dataRating: {rating},
      navigation,
      configs,
    } = this.props;

    const {product, isAddToCart} = this.state;

    if (!product.get('id')) {
      return (
        <ThemedView isFullView>
          <Empty
            title={t('empty:text_title_product_detail')}
            subTitle={t('empty:text_subtitle_product_detail')}
            clickButton={() => navigation.navigate(homeTabs.shop)}
          />
        </ThemedView>
      );
    }
    const images = this.images();
    const related_ids = product.get('related_ids').size
      ? product.get('related_ids').toJS()
      : [];

    const firstImage = images.first();
    const image =
      firstImage && firstImage.get('src') ? firstImage.get('src') : '';
    const stock_status = ['instock', 'onbackorder'];

    const description = product.get('description') ? product.get('description').replace(/<\/?[^>]+(>|$)/g, ""): null;

    return (
      <ScrollProductDetail
        headerTitle={product.get('name')}
        imageElement={
          <ProductImages
            images={images}
            product_id={product.get('id')}
            url={product.get('permalink')}
            name_product={product.get('name')}
            height={HEADER_MAX_HEIGHT}
          />
        }
        footerElement={
          configs.get('toggleCheckout') &&
          product.get('purchasable') &&
          stock_status.includes(product.get('stock_status')) && (
            <FooterProduct
              isAddToCart={isAddToCart}
              onPressAddCart={this.addToCart}
              onPressViewCart={() => navigation.navigate(homeTabs.cart)}
            />
          )
        }
        heightViewImage={HEADER_MAX_HEIGHT}>
        <Container style={styles.container}>
          <View style={styles.viewCategoryRating}>
            <CategoryName product={product} style={styles.textCategory} />
            <TouchableOpacity
              style={styles.viewRating}
              onPress={() =>
                this.props.navigation.navigate(mainStack.product_review, {
                  product_id: product.get('id'),
                  image: image,
                  name: product.get('name'),
                })
              }>
              <Rating size={12} startingValue={rating} readonly />
              <Text style={styles.textRating}>({rating})</Text>
            </TouchableOpacity>
          </View>
          <Text h2 medium style={styles.textName}>
            {product.get('name')}
          </Text>
          {this.showPrice()}
          {description && (
            <Text
              colorThird
              h6
              numberOfLines={2}
              style={styles.textDescription}
            >
              {description}
            </Text>
          )}
          {this.showInfoType()}
          {this.showStock()}
          <ListItem
            title={t('catalog:text_description')}
            onPress={() =>
              this.props.navigation.navigate(mainStack.product_description, {
                description: product.get('description'),
              })
            }
            small
            chevron
            type="underline"
          />

          {product.get('attributes') && product.get('attributes').size ? (
            <ListItem
              title={t('catalog:text_information')}
              onPress={() =>
                this.props.navigation.navigate(mainStack.product_attribute, {
                  attributes: product.get('attributes'),
                })
              }
              small
              chevron
              type="underline"
            />
          ): null}

          <ListItem
            title={t('catalog:text_reviews')}
            onPress={() =>
              this.props.navigation.navigate(mainStack.product_review, {
                product_id: product.get('id'),
                image: image,
                name: product.get('name'),
              })
            }
            small
            chevron
            type="underline"
          />
        </Container>
        {related_ids.length ? (
          <View style={styles.viewRelated}>
            <RelatedProducts data={related_ids.join(',')} />
          </View>
        ) : null}
        {/*{product.get('purchasable') && (*/}
        {/*<Container style={styles.viewFooter}>*/}
        {/*<Button title={t('common:text_add_cart')} onPress={this.addToCart} />*/}
        {/*</Container>*/}
        {/*)}*/}
      </ScrollProductDetail>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: margin.big,
  },
  viewCategoryRating: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: margin.small / 2,
  },
  textCategory: {
    flex: 1,
    marginRight: margin.base,
  },
  viewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRating: {
    fontSize: 10,
    lineHeight: 15,
    marginLeft: margin.small / 2,
  },
  textName: {
    marginBottom: margin.small,
  },
  viewPrice: {
    marginBottom: margin.large,
  },
  textDescription: {
    marginBottom: margin.large,
  },
  viewStock: {
    marginTop: margin.large,
    marginBottom: margin.small + margin.big,
  },
  viewRelated: {
    marginBottom: margin.big,
  },
  viewFooter: {
    marginVertical: margin.big,
  },
});

const mapStateToProps = state => {
  return {
    attribute: attributeSelector(state),
    dataRating: dataRatingSelector(state),
    currency: currencySelector(state),
    defaultCurrency: defaultCurrencySelector(state),
    lang: languageSelector(state),
    configs: configsSelector(state),
  };
};

const withReduce = connect(mapStateToProps);

export default compose(
  withReduce,
  defaultPropsData,
  getSingleData,
  withLoading,
)(Product);
