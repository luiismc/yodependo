import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView, Icon, Text, withTheme } from 'src/components';

import { withNavigation } from 'react-navigation';
import { useTranslation } from 'react-i18next';

import { mainStack } from '../config/navigator';

import { margin, padding, borderRadius } from 'src/components/config/spacing';

const Search = function({ navigation, placeholder, theme }) {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate(mainStack.search)}>
        <View style={[styles.viewInfo, {backgroundColor: theme.SearchBar.bgColor}]}>
          <Icon name="search" size={20} />
          <Text style={styles.text} colorThird>
            {placeholder ? placeholder : t('common:text_search')}
          </Text>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: padding.large,
  },
  viewInfo: {
    height: 46,
    borderRadius: borderRadius.base,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padding.large,
  },
  text: {
    flex: 1,
    marginLeft: margin.base,
  },
});

export default withTheme(withNavigation(Search));
