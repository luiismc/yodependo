import React from 'react';
import { StyleSheet } from 'react-native';

import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { withTheme } from 'src/components';

import html from './html';
import { PUBLISHABLE_KEY } from 'src/config/stripe';

class PaymentStripe extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  onMessage = event => {
    const { handlePaymentProgress } = this.props;
    handlePaymentProgress({
      method: 'stripe',
      data: event.nativeEvent.data,
    });
  };

  render() {
    const { theme } = this.props;

    const htmlString = html.replace(
      'INJECT_DATA',
      `var PUBLISHABLE_KEY = window.PUBLISHABLE_KEY = '${PUBLISHABLE_KEY}';
       var THEME_TYPE = window.THEME_TYPE = '${theme.key}'
      `
    );

    return (
      <View style={{ flex: 1 }}>
        <WebView
          style={styles.container}
          onMessage={this.onMessage}
          originWhitelist={['*']}
          source={{ html: htmlString }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
});

export default withTheme(PaymentStripe);
