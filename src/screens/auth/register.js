import React from 'react';
import {connect} from 'react-redux';
import omit from 'lodash/omit';
import assign from 'lodash/assign';
import auth from '@react-native-firebase/auth';

import {
  StyleSheet,
  ScrollView,
  View,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import {Header, Loading, Text, ThemedView} from 'src/components';
import Container from 'src/containers/Container';
import Input from 'src/containers/input/Input';
import InputMobile from 'src/containers/input/InputMobile';
import Button from 'src/containers/Button';
import TextHtml from 'src/containers/TextHtml';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';
import ModalVerify from './containers/ModalVerify';
import SocicalAccounts from './containers/SocicalAccounts';

import {signUpWithEmail} from 'src/modules/auth/actions';
import {authSelector} from 'src/modules/auth/selectors';
import {validatorRegister} from 'src/modules/auth/validator';
import {configsSelector, languageSelector} from 'src/modules/common/selectors';
import {checkPhoneNumber, checkInfo} from 'src/modules/auth/service';

import {authStack} from 'src/config/navigator';
import {margin, padding} from 'src/components/config/spacing';
import {lineHeights} from 'src/components/config/fonts';
import {changeColor} from 'src/utils/text-html';
import {showMessage} from 'react-native-flash-message';

class RegisterScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      data: {
        first_name: '',
        last_name: '',
        name: '',
        email: '',
        password: '',
        phone_number: '',
        country_no: '',
        subscribe: false,
      },
      visibleModal: false,
      loadingSend: false,
      error: {
        message: null,
        errors: null,
      },
    };
    this.confirmation = null;

    // auth().onAuthStateChanged(user => {
    //   if (user && user.delete) {
    //     user
    //       .delete()
    //       .then(() => {
    //         console.log('deleted!');
    //       })
    //       .catch(e => {
    //         console.log('delete error!', e);
    //       });
    //   }
    // });
  }
  changeData = value => {
    this.setState({
      data: {
        ...this.state.data,
        ...value,
      },
    });
  };

  handleRegister = data => {
    this.props.dispatch(signUpWithEmail(data));
  };

  handleVerifyOtp = verify => {
    const {data} = this.state;
    const {phone_number, country_no} = data;
    if (verify) {
      this.setState({
        visibleModal: false,
      });
      const user_phone_number = phone_number.includes(country_no)
        ? phone_number
        : country_no + phone_number;
      const prepareData = assign(omit(data, ['country_no']), {
        phone_number: user_phone_number,
      });
      this.handleRegister(prepareData);
    }
  };

  clickRegister = () => {
    const {
      screenProps: {t},
      language,
    } = this.props;
    const {data} = this.state;
    const prepareData = omit(data, ['phone_number', 'country_no']);
    const errors = validatorRegister(prepareData, false, language);
    if (errors.size > 0) {
      this.setState({
        error: {
          message: t('notifications:text_fill_value'),
          errors: errors.toJS(),
        },
      });
    } else {
      this.setState({
        error: {
          errors: null,
          message: null,
        },
      });
      this.handleRegister(prepareData);
    }
  };
  clickRegisterWithPhone = async () => {
    try {
      const {
        screenProps: {t},
        language,
      } = this.props;
      const {data} = this.state;

      const {phone_number, country_no} = data;
      const user_phone_number = phone_number.includes(country_no)
        ? phone_number
        : country_no + phone_number;
      const prepareData = assign(omit(data, ['country_no']), {
        phone_number: user_phone_number,
      });

      const errors = validatorRegister(prepareData, true, language);
      if (errors.size > 0) {
        this.setState({
          error: {
            message: t('notifications:text_fill_value'),
            errors: errors.toJS(),
          },
        });
      } else {
        this.setState({
          loadingSend: true,
          error: {
            errors: null,
            message: null,
          },
        });
        await checkPhoneNumber({
          phone_number: user_phone_number,
          type: 'register',
        });
        await checkInfo({
          name: prepareData.name,
          email: prepareData.email,
        });
        this.confirmation = await auth().signInWithPhoneNumber(
          user_phone_number,
        );
        this.setState({
          visibleModal: true,
          loadingSend: false,
        });
      }
    } catch (e) {
      showMessage({
        message: e.message,
        type: 'danger',
      });
      this.setState({
        loadingSend: false,
      });
    }
  };

  render() {
    const {
      navigation,
      auth: {pending},
      screenProps: {t, theme},
      isMobilePhone,
    } = this.props;
    const {
      data: {
        email,
        first_name,
        last_name,
        name,
        phone_number,
        country_no,
        password,
        subscribe,
      },
      error: {message, errors},
      visibleModal,
      loadingSend,
    } = this.state;

    return (
      <ThemedView isFullView>
        <Loading visible={pending} />
        <Header
          leftComponent={<IconHeader />}
          centerComponent={<TextHeader title={t('common:text_register')} />}
        />
        <KeyboardAvoidingView
          behavior="height"
          style={styles.keyboard}
          // contentContainerStyle={{flex: 1}}
        >
          <ScrollView>
            <Container>
              {message ? (
                <TextHtml
                  value={message}
                  style={changeColor(theme.colors.error)}
                />
              ) : null}
              <Input
                label={t('auth:text_input_first_name')}
                value={first_name}
                onChangeText={value => this.changeData({first_name: value})}
                error={errors && errors.first_name}
              />
              <Input
                label={t('auth:text_input_last_name')}
                value={last_name}
                onChangeText={value => this.changeData({last_name: value})}
                error={errors && errors.last_name}
              />
              <Input
                label={t('auth:text_input_user')}
                value={name}
                onChangeText={value => this.changeData({name: value})}
                error={errors && errors.name}
              />
              {isMobilePhone ? (
                <InputMobile
                  value={phone_number}
                  onChangePhoneNumber={({value, code}) =>
                    this.changeData({phone_number: value, country_no: code})
                  }
                  error={errors && errors.phone_number}
                />
              ) : null}
              <Input
                label={t('auth:text_input_email')}
                value={email}
                onChangeText={value => this.changeData({email: value})}
                error={errors && errors.email}
              />
              <Input
                label={t('auth:text_input_password')}
                value={password}
                secureTextEntry
                onChangeText={value => this.changeData({password: value})}
                error={errors && errors.password}
              />
              <View style={styles.viewSwitch}>
                <Text style={styles.textSwitch} colorSecondary>
                  {t('auth:text_agree_register')}
                </Text>
                <Switch
                  value={subscribe}
                  onValueChange={value => this.changeData({subscribe: value})}
                />
              </View>
              <Button
                title={t('auth:text_register')}
                onPress={
                  isMobilePhone
                    ? this.clickRegisterWithPhone
                    : this.clickRegister
                }
                loading={loadingSend}
              />
              <SocicalAccounts style={styles.viewAccount} />
              <Text
                medium
                style={styles.textHaveAccount}
                onPress={() => navigation.navigate(authStack.login)}>
                {t('auth:text_already_account')}
              </Text>
              {visibleModal && (
                <ModalVerify
                  visible={visibleModal}
                  type={'register'}
                  phone={
                    phone_number.includes(country_no)
                      ? phone_number
                      : country_no + phone_number
                  }
                  confirmation={this.confirmation}
                  handleVerify={this.handleVerifyOtp}
                  setModalVisible={visibleModal =>
                    this.setState({visibleModal})
                  }
                />
              )}
            </Container>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  viewSwitch: {
    marginVertical: margin.big,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textSwitch: {
    flex: 1,
    lineHeight: lineHeights.h4,
    marginRight: margin.large,
  },
  viewAccount: {
    marginVertical: margin.big,
  },
  textHaveAccount: {
    paddingVertical: padding.small,
    marginTop: margin.base,
    marginBottom: margin.big,
    textAlign: 'center',
  },
});

const mapStateToProps = state => {
  const configs = configsSelector(state);
  return {
    auth: authSelector(state),
    language: languageSelector(state),
    isMobilePhone: configs.get('toggleLoginSMS'),
  };
};

export default connect(mapStateToProps)(RegisterScreen);
