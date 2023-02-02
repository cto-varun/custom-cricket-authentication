"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _reactRouterDom = require("react-router-dom");
var _MaskedInput = _interopRequireDefault(require("./MaskedInput"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _renderTitle = _interopRequireDefault(require("./renderTitle"));
var _uuid = require("uuid");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  Option
} = _antd.Select;
const {
  Text
} = _antd.Typography;
const layout = {
  labelCol: {
    span: 0
  },
  wrapperCol: {
    span: 18
  }
};

// Flag for checkAuthToken
/* Set this flag to TRUE when deploying */
const CHECK_AUTH_TOKEN = true;
/* Set this flag to FALSE when developing */
// const CHECK_AUTH_TOKEN = false;

const OptionBox = _ref => {
  let {
    description,
    text,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "radio-option-boxes"
  }, /*#__PURE__*/_react.default.createElement(Text, {
    className: "description"
  }, description), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
    className: "question"
  }, text)), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      marginTop: 24
    }
  }, children));
};
const handleOTPSent = (successStates, errorStates, setOTPStatus) => (subscriptionId, topic, eventData, closure) => {
  const state = eventData.value;
  const isSuccess = successStates.includes(state);
  const isFailure = errorStates.includes(state);
  if (isSuccess || isFailure) {
    setOTPStatus('sent');
    _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
  }
};
const logCustAuthDetails = (authInfo, custAuthLogInfo, isSuccess) => {
  const submitEvent = 'SUBMIT';
  const {
    datasource,
    workflow
  } = custAuthLogInfo;
  const {
    customerInfo,
    authMethod,
    bypassAnswer
  } = authInfo;
  const {
    billingAccountNumber
  } = customerInfo;
  const {
    attId,
    asapId,
    profile
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
  let firstName;
  let lastName;
  if (customerInfo?.length) {
    firstName = customerInfo[0]?.firstName;
    lastName = customerInfo[0]?.lastName;
  }
  _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
    header: {
      registrationId: workflow,
      workflow,
      eventType: 'INIT'
    }
  });
  _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
    header: {
      registrationId: workflow,
      workflow,
      eventType: submitEvent
    },
    body: {
      datasource,
      request: {
        body: {
          billingAccountNumber,
          phoneNumber: window[window.sessionStorage?.tabId].NEW_CTN,
          customerName: {
            firstName,
            lastName
          },
          attuid: attId,
          asapId,
          profileName: profile,
          authMethod: authMethod.toUpperCase(),
          authStatus: isSuccess ? 'SUCCESS' : 'FAILURE',
          bypassReason: bypassAnswer
        }
      }
    }
  });
};
const hanldeValidateCustomerResponse = (successStates, errorStates, routeOnSuccess, history, authInfo, custAuthLogInfo, setIsLoading, setErrorMsg, authSucessEvent, authDeniedEvent, ban, ctn, conversationId) => (subscriptionId, topic, eventData, closure) => {
  const state = eventData.value;
  const authToken = eventData?.event?.data?.data?.token;
  const isSuccess = CHECK_AUTH_TOKEN ? successStates.includes(state) && (authToken !== undefined || authToken !== null) : successStates.includes(state);
  const isFailure = CHECK_AUTH_TOKEN ? errorStates.includes(state) && (authToken === undefined || authToken === null) : errorStates.includes(state);
  if (isSuccess || isFailure) {
    // Get the token from API call and send it to authSuccessEvent config
    setIsLoading(false);
    if (isSuccess) {
      window[sessionStorage.tabId].conversationId = conversationId;
      const authSuccessBody = CHECK_AUTH_TOKEN ? {
        ban,
        ctn,
        route: routeOnSuccess,
        message: 'Customer Authenticated successfully',
        // Add the auth token here from eventData
        authToken: authToken
      } : {
        ban,
        ctn,
        route: routeOnSuccess,
        message: 'Customer Authenticated successfully'
      };
      if (authSucessEvent) {
        _componentMessageBus.MessageBus.send(authSucessEvent, {
          header: {
            source: 'security',
            event: authSucessEvent
          },
          body: authSuccessBody
        });
      }
      logCustAuthDetails(authInfo, custAuthLogInfo, isSuccess);
    }
    _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
  }
};
const handleGetAuthTokenResponse = (successStates, errorStates, routeOnSuccess, history, authInfo, custAuthLogInfo, setIsLoading, setErrorMsg, authSucessEvent, authDeniedEvent, ban, ctn, conversationId, isAuthBypass) => (subscriptionId, topic, eventData, closure) => {
  const state = eventData.value;
  const authToken = eventData?.event?.data?.data?.token;
  const isSuccess = successStates.includes(state) && (authToken !== undefined || authToken !== null);
  const isFailure = errorStates.includes(state) && (authToken === undefined || authToken === null);
  if (isSuccess || isFailure) {
    if (isSuccess) {
      // Get the token from API call and send it to authSuccessEvent config
      window[sessionStorage.tabId].conversationId = conversationId;
      if (authSucessEvent) {
        _componentMessageBus.MessageBus.send(authSucessEvent, {
          header: {
            source: 'security',
            event: authSucessEvent
          },
          body: {
            ban,
            ctn,
            route: routeOnSuccess,
            message: isAuthBypass ? 'Customer Authenticated via bypass' : 'Customer Authenticated successfully',
            // Add the auth token here from eventData
            authToken: authToken
          }
        });
      }
      logCustAuthDetails(authInfo, custAuthLogInfo, isSuccess);
    }
    setIsLoading(false);
    _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
  }
};
const SecurityQuestion = _ref2 => {
  let {
    data,
    workflows,
    onCancel,
    onAuthRouteTo,
    datasources,
    bypassOptionsMetadata,
    profiles,
    landingBoard,
    authSuccessEvent,
    authDeniedEvent,
    ban,
    ctn,
    backButtonString,
    enableBackButton,
    handleBackClick
  } = _ref2;
  const {
    question,
    questionCode,
    billingAccountNumber,
    bypassOnly
  } = data;
  const {
    otp,
    validateCustomer,
    logCustAuth,
    getAuthToken
  } = workflows;
  const [form] = _antd.Form.useForm();
  const [radioVal, setRadioVal] = (0, _react.useState)();
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [errorMsg, setErrorMsg] = (0, _react.useState)('');
  const history = (0, _reactRouterDom.useHistory)();
  const [otpStatus, setOTPStatus] = (0, _react.useState)(undefined);
  let {
    mechId,
    attId
  } = window[sessionStorage?.tabId].COM_IVOYANT_VARS;
  let restrictedBypassOptions = profiles?.categories?.find(c => c.name === window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile)?.categories?.find(c => c.name === 'restrictBypassOptions')?.bypassOptions;
  let bypassOptions = [];
  if (restrictedBypassOptions && restrictedBypassOptions?.length) {
    bypassOptions = bypassOptionsMetadata?.filter(option => restrictedBypassOptions?.find(name => name === option.name));
  } else {
    bypassOptions = bypassOptionsMetadata;
  }

  // To order the options based on rank
  bypassOptions?.sort(function (a, b) {
    return parseInt(a?.rank, 10) - parseInt(b?.rank, 10);
  });
  const isFormValid = () => {
    const {
      receivedPin,
      securityAnswer,
      bypassAnswer,
      receivedOTP
    } = form.getFieldsValue();
    const fieldMapping = {
      pin: receivedPin?.unmasked,
      sqa: securityAnswer?.unmasked,
      bypass: bypassAnswer,
      otp: receivedOTP?.unmasked
    };
    return form.getFieldsError().filter(_ref3 => {
      let {
        errors
      } = _ref3;
      return errors.length;
    }).length === 0 && fieldMapping[radioVal];
  };
  const requestOTP = () => {
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = otp;
    const submitEvent = 'SUBMIT';
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleOTPSent(successStates, errorStates, setOTPStatus), {});
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: submitEvent
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            phonenumber: data[0]?.ctn
          }
        },
        responseMapping
      }
    });
  };
  const onFinish = async values => {
    const authInfo = {
      authMethod: radioVal,
      bypassAnswer: values?.bypassAnswer,
      customerInfo: data
    };
    const custAuthLogInfo = {
      datasource: datasources[logCustAuth.datasource],
      workflow: logCustAuth.workflow
    };
    const conversationId = `${mechId}~${attId}~${billingAccountNumber}~${(0, _uuid.v4)()}`;
    if (radioVal === 'bypass' && values?.bypassAnswer) {
      const selBypassOption = bypassOptions.find(option => option.name === values.bypassAnswer);
      window[sessionStorage.tabId].conversationId = conversationId;
      if (selBypassOption && selBypassOption?.bypass === 'false') {
        setErrorMsg(selBypassOption.message);
        setIsLoading(false);
        logCustAuthDetails(authInfo, custAuthLogInfo, false);
        _componentMessageBus.MessageBus.send(authDeniedEvent, {
          header: {
            source: 'security',
            event: authDeniedEvent
          },
          body: {
            ban,
            ctn,
            route: onAuthRouteTo,
            message: 'Access Denied for Customer Account'
          }
        });
      } else {
        if (CHECK_AUTH_TOKEN) {
          // Get Auth token - CallService on succesfull auth bypass - START
          _componentMessageBus.MessageBus.send('WF.'.concat(getAuthToken.workflow).concat('.INIT'), {
            header: {
              registrationId: getAuthToken.workflow,
              workflow: getAuthToken.workflow,
              eventType: 'INIT'
            }
          });
          _componentMessageBus.MessageBus.subscribe(getAuthToken.workflow, 'WF.'.concat(getAuthToken.workflow).concat('.STATE.CHANGE'), handleGetAuthTokenResponse(getAuthToken.successStates, getAuthToken.errorStates, onAuthRouteTo, history, authInfo, custAuthLogInfo, setIsLoading, setErrorMsg, authSuccessEvent, authDeniedEvent, ban, ctn, conversationId, true), {});
          _componentMessageBus.MessageBus.send('WF.'.concat(getAuthToken.workflow).concat('.').concat('SUBMIT'), {
            header: {
              registrationId: getAuthToken.workflow,
              workflow: getAuthToken.workflow,
              eventType: 'SUBMIT'
            },
            body: {
              datasource: {
                ...datasources[getAuthToken.datasource],
                baseUri: datasources[getAuthToken.datasource].baseUri.replace('{ban}', ban.toString()),
                url: datasources[getAuthToken.datasource].url.replace('{ban}', ban.toString())
              },
              request: {},
              responseMapping: getAuthToken.responseMapping
            }
          });
          // Get Auth token - CallService on succesfull auth bypass - END
        }

        if (!CHECK_AUTH_TOKEN) {
          _componentMessageBus.MessageBus.send(authSuccessEvent, {
            header: {
              source: 'security',
              event: authSuccessEvent
            },
            body: {
              ban,
              ctn,
              route: onAuthRouteTo,
              message: 'Customer Authenticated via bypass'
            }
          });
          setErrorMsg('');
          logCustAuthDetails(authInfo, custAuthLogInfo, true);
        }
      }
    } else {
      setIsLoading(true);
      setErrorMsg('');
      let requestBody = {};
      if (radioVal === 'pin') {
        requestBody = {
          pin: values.receivedPin?.unmasked
        };
      }
      if (radioVal === 'otp') {
        requestBody = {
          pin: values.receivedOTP?.unmasked
        };
      }
      if (radioVal === 'sqa') {
        requestBody = {
          securityAnswer: {
            questionCode,
            answer: values.securityAnswer?.unmasked
          }
        };
      }
      const {
        workflow,
        datasource,
        successStates,
        errorStates,
        responseMapping
      } = validateCustomer;
      const submitEvent = 'SUBMIT';
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), hanldeValidateCustomerResponse(successStates, errorStates, onAuthRouteTo, history, authInfo, custAuthLogInfo, setIsLoading, setErrorMsg, authSuccessEvent, authDeniedEvent, ban, ctn, conversationId), {});
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: submitEvent
        },
        body: {
          datasource: datasources[datasource],
          request: {
            params: {
              targetAccount: billingAccountNumber
            },
            body: requestBody
          },
          responseMapping
        }
      });
    }
  };
  const onRadioChange = e => {
    setRadioVal(e.target.value);
    setErrorMsg('');
    form.resetFields(['receivedPin', 'securityAnswer', 'bypassAnswer']);
  };
  const columns = [{
    title: (0, _renderTitle.default)('User Name'),
    dataIndex: 'userName'
  }, {
    title: (0, _renderTitle.default)('Account Name'),
    dataIndex: 'accountName'
  }, {
    title: 'BAN',
    dataIndex: 'billingAccountNumber'
  }, {
    title: 'CTN',
    dataIndex: 'ctn'
  }, {
    title: 'E-mail',
    dataIndex: 'email'
  }, {
    title: 'Device',
    dataIndex: 'device'
  }, {
    title: 'Subscriber Status',
    dataIndex: 'subscriberStatus'
  }, {
    title: 'SIM',
    dataIndex: 'sim'
  }, {
    title: 'IMEI',
    dataIndex: 'imei'
  }, {
    title: (0, _renderTitle.default)('imsi'),
    dataIndex: 'imsi'
  }];
  const isValidPIN = (_, value) => {
    if (value?.unmasked && value?.unmasked.length < 4) {
      return Promise.reject(`PIN should be 4 digits`);
    }
    return Promise.resolve();
  };
  const isValidOTP = (_, value) => {
    if (value?.unmasked && value?.unmasked.length < 4) {
      return Promise.reject(`OTP should be 4 digits`);
    }
    return Promise.resolve();
  };
  const isValidSecurityAnswer = (_, value) => {
    if (value?.unmasked && value?.unmasked.length < 4) {
      return Promise.reject(`Security answer should have atleast 4 characters`);
    }
    return Promise.resolve();
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, null, errorMsg !== '' && /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: errorMsg,
    type: "error"
  }))))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "mb"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, enableBackButton && /*#__PURE__*/_react.default.createElement(_antd.Row, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    className: "back-button",
    onClick: () => handleBackClick()
  }, /*#__PURE__*/_react.default.createElement(_icons.ArrowLeftOutlined, {
    style: {
      margin: 'auto 0',
      paddingRight: '10px'
    }
  }), backButtonString)), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    span: 24,
    style: {
      paddingTop: '20px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(Text, {
    strong: true
  }, 'PLEASE CHOOSE AUTHENTICATION METHOD'))))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "mb"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    className: "caller-search-table",
    columns: columns,
    dataSource: data,
    size: "middle",
    pagination: false
  }))), /*#__PURE__*/_react.default.createElement(_antd.Form, {
    form: form,
    onFinish: onFinish
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio.Group, {
    style: {
      width: '100%'
    },
    className: "mb",
    onChange: onRadioChange,
    value: radioVal
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 24
  }, !bypassOnly && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 18,
    xl: 12,
    xxl: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: "sqa",
    disabled: data[0]?.banStatus === 'T' || question === undefined
  }, "Authenticate With Security Question and Answer"), /*#__PURE__*/_react.default.createElement(OptionBox, {
    description: "Security Question",
    text: question
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, _extends({}, layout, {
    name: "securityAnswer",
    rules: [{
      validator: isValidSecurityAnswer
    }]
  }), /*#__PURE__*/_react.default.createElement(_MaskedInput.default, {
    placeholder: "Enter your security answer",
    disabled: radioVal !== 'sqa',
    autoComplete: "off"
  })))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 18,
    xl: 12,
    xxl: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: "pin"
  }, "Authenticate with PIN"), /*#__PURE__*/_react.default.createElement(OptionBox, {
    description: "Please confirm security PIN code from the customer and enter recieved PIN code to authenticate."
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, _extends({}, layout, {
    name: "receivedPin",
    rules: [{
      validator: isValidPIN
    }]
  }), /*#__PURE__*/_react.default.createElement(_MaskedInput.default, {
    placeholder: "Enter PIN code",
    disabled: radioVal !== 'pin',
    autoComplete: "off",
    maxLength: 4,
    isNumber: true
  })))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 18,
    xl: 12,
    xxl: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: "otp",
    disabled: data[0]?.banStatus === 'T'
  }, "Authenticate with OTP"), /*#__PURE__*/_react.default.createElement(OptionBox, {
    description: "Please click on Send OTP to send OTP to Customer. Once Customer provides OTP enter it to authenticate"
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    justify: "start"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 16
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, _extends({}, layout, {
    name: "receivedOTP",
    wrapperCol: {
      sm: 20
    },
    rules: [{
      validator: isValidOTP
    }]
  }), /*#__PURE__*/_react.default.createElement(_MaskedInput.default, {
    placeholder: "Enter One Time Passcode",
    disabled: radioVal !== 'otp' || radioVal === 'otp' && otpStatus !== 'sent',
    autoComplete: "off",
    maxLength: 4,
    isNumber: true
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: radioVal !== 'otp' ? 'default' : 'primary',
    onClick: () => requestOTP(),
    disabled: radioVal !== 'otp'
  }, "Send OTP")))))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 18,
    xl: 12,
    xxl: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: "bypass"
  }, "Bypass Authentication"), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, _extends({}, layout, {
    name: "bypassAnswer"
  }), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    style: {
      marginTop: 20,
      maxWidth: 320
    },
    placeholder: "Please select a reason",
    disabled: radioVal !== 'bypass'
  }, bypassOptions.map(o => /*#__PURE__*/_react.default.createElement(Option, {
    key: o.name,
    value: o.name
  }, o.option))))))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    style: {
      marginBottom: 0
    },
    shouldUpdate: true
  }, () => /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: isFormValid() ? 'primary' : 'default',
    htmlType: "submit",
    loading: isLoading,
    disabled: !isFormValid()
  }, radioVal && radioVal === 'bypass' ? 'Continue' : 'Authenticate')))))));
};
var _default = SecurityQuestion;
exports.default = _default;
module.exports = exports.default;