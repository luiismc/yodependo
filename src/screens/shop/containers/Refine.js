import React from 'react';

import { withNavigation } from 'react-navigation';
import { useTranslation } from 'react-i18next';

import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, Text } from 'src/components';

import { mainStack } from 'src/config/navigator';

import { margin } from 'src/components/config/spacing';

const Refine = function({ navigation, parent, data }) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.touch} onPress={() => navigation.navigate(mainStack.refine, { parent, data })}>
      <Icon name="sliders" type="feather" size={16} />
      <Text medium style={styles.text}>
        {t('catalog:text_refine')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    lineHeight: 20,
    marginLeft: margin.small,
  },
});

export default withNavigation(Refine);
