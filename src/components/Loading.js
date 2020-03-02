import React, {Component} from 'react';
import { StyleSheet, Modal, View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import Text from './text/Text';
import { withTheme, spacing } from './config';

class Loading extends Component {
  render() {
    const { backgroundColor, color, visible } = this.props;
    return (
      <Modal
        animationType="none"
        transparent
        visible={visible}
      >
        {/*{Platform.OS === 'android' ?*/}
          {/*<StatusBar backgroundColor={backgroundColor}/>*/}
          {/*: null*/}
        {/*}*/}
        <View
          style={[
            styles.viewLoading,
            { backgroundColor: backgroundColor}
          ]}
        >
          <ActivityIndicator size='large' color={color}/>
          <Text medium h4 style={{ color: color, marginTop: spacing.margin.base}}>Loading...</Text>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  viewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default withTheme(Loading, 'Loading');
