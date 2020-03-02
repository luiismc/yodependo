import React from 'react';

import {compose} from 'recompose';
import {connect} from 'react-redux';
import {List, Map, fromJS} from 'immutable';

import {withNavigation} from 'react-navigation';
import {useTranslation} from 'react-i18next';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {withTheme, Image, Badge, Text} from 'src/components';
import WishListIcon from '../WishListIcon';
import Price from '../Price';
import Rating from '../Rating';
import Button from '../Button';

import {configsSelector} from 'src/modules/common/selectors';
import {addToCart} from 'src/modules/cart/actions';

import {margin} from 'src/components/config/spacing';
import {mainStack} from 'src/config/navigator';

import {SIMPLE} from 'src/config/product';

export function ItemDefault(props) {
  const {item, width, height, navigation, dispatch, navigationType, theme, configs} = props;
  const {name, images, price_format, on_sale, is_new, type, rating_count, id, purchasable, stock_status} = item;
  const {t} = useTranslation();

  const productItemStyle = {
    width: width,
  };

  const productItemImageStyle = {
    width,
    height,
  };
  const listStatus = ['instock', 'onbackorder'];

  return (
    <TouchableOpacity
      style={productItemStyle}
      onPress={() => navigation[navigationType](mainStack.product, {product: item})}
    >
      <Image
        source={
          images && images.length
            ? {uri: images[0].shop_single, cache: 'reload'}
            : require('src/assets/images/pDefault.png')
        }
        style={productItemImageStyle}
        PlaceholderContent={<ActivityIndicator/>}
      />

      <View style={styles.viewInfo}>
        <Text
          h6
          style={[
            styles.textName,
            {
              color: theme.ProductItem.color,
            },
          ]}
        >
          {name}
        </Text>
        <Price price_format={price_format} type={type} style={styles.textPrice}/>
        <View style={styles.viewFooter}>
          <Rating size={12} startingValue={rating_count} readonly />
          {configs.get('toggleCheckout') &&
            type === SIMPLE &&
            purchasable &&
            listStatus.includes(stock_status) && (
              <Button
                title={t('common:text_add')}
                size="small"
                buttonStyle={styles.buttonAdd}
                onPress={() =>
                  dispatch(
                    addToCart({
                      product_id: item.id,
                      quantity: 1,
                      variation: Map(),
                      product: fromJS(item),
                      meta_data: List(),
                    }),
                  )
                }
              />
            )}
        </View>
      </View>

      <View style={styles.labelWrap}>
        <View>
          {is_new ? <Badge value={t('common:text_new')} status="success" containerStyle={styles.badge}/> : null}
          {on_sale ? <Badge value={t('common:text_sale')} status="warning"/> : null}
        </View>

        <View>
          <WishListIcon product_id={id}/>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  viewInfo: {
    marginTop: margin.base + 2,
  },
  labelWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textName: {
    marginBottom: 4,
  },
  textPrice: {
    marginBottom: margin.small,
  },
  badge: {
    marginBottom: 5,
  },
  viewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonAdd: {
    minHeight: 29,
  },
});

ItemDefault.defaultProps = {
  width: 227,
  height: 227,
  navigationType: 'navigate',
};

const mapStateToProps = state => {
  return {
    configs: configsSelector(state),
  };
};

export default compose(
  withTheme,
  withNavigation,
  connect(mapStateToProps)
)(ItemDefault);
