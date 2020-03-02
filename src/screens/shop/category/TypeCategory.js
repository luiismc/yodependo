import React from 'react';
import {ScrollView, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Text, withTheme} from 'src/components';
import Container from 'src/containers/Container';

import {margin} from 'src/components/config/spacing';

const TypeCategory = ({selectVisit, data, onChange, theme}) => {
  return (
    <Container disable="right" style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.viewList}>
          {data.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.item,
                category.id === selectVisit && {
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => onChange(category.id)}>
              <Text h4 medium style={styles.text} colorSecondary={category.id !== selectVisit}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: margin.big - 4,
  },
  viewList: {
    flexDirection: 'row',
  },
  item: {
    paddingVertical: 3,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    marginRight: 40,
  },
  text: {
    textTransform: 'uppercase',
  },
});

TypeCategory.defaultProps = {
  data: [],
  onChange: () => {},
};
export default withTheme(TypeCategory);
