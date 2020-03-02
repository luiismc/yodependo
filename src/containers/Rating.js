import React from 'react';
import { View } from 'react-native';
import { withTheme, Icon } from 'src/components';

const Rating = ({ theme, startingValue, count, color, size, readonly, pad, onStartRating }) => {
  let listsIcon = [];
  const colorIcon = color ? color : theme.colors.warning;

  for (let i = 1; i <= count; i++) {
    listsIcon.push(
      <Icon
        key={i}
        name="star"
        type="font-awesome"
        color={i <= startingValue ? colorIcon : theme.colors.grey2}
        size={size}
        onPress={readonly ? null : () => onStartRating(i)}
        containerStyle={
          i < count && {
            paddingRight: pad,
          }
        }
      />
    );
  }
  return <View style={{ flexDirection: 'row' }}>{listsIcon.map(icon => icon)}</View>;
};

Rating.defaultProps = {
  startingValue: 1,
  count: 5,
  size: 16,
  pad: 4,
  readonly: false,
  onStartRating: () => {},
};

export default withTheme(Rating);
