"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _SearchList = _interopRequireDefault(require("./SearchList"));
var _ContactSearchList = _interopRequireDefault(require("./ContactSearchList"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _SecurityQuestion = _interopRequireDefault(require("./SecurityQuestion"));
var _componentCache = require("@ivoyant/component-cache");
var _reactRouterDom = require("react-router-dom");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const INTERACTION_INIT_EVENT = 'SESSION.INTERACTION.INIT';
const getNames = (name, lastName) => {
  return `${name} ${lastName}`;
};
const processSearchResults = function (searchResults, subscriberStatuses) {
  let searchType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Account';
  let results = [];
  if (searchResults) {
    if (searchType === 'Contact') {
      results = JSON.parse(searchResults).map((customer, index) => {
        const {
          contactCTN,
          emailAddress,
          firstName,
          lastName,
          createdTime
        } = customer;
        return {
          key: index,
          firstName,
          lastName,
          ctn: contactCTN,
          email: emailAddress,
          createdTime
        };
      });
    } else {
      results = JSON.parse(searchResults).map((customer, index) => {
        const {
          ctn,
          emailAddress,
          device,
          name,
          subscriberStatus,
          accountName,
          statusDate,
          statusDescription,
          billingAccountNumber,
          accountType,
          accountSubType,
          banStatus,
          archived
        } = customer;
        return {
          key: index,
          ctn,
          device: device?.model,
          sim: device?.iccid,
          imei: device?.imei,
          imsi: device?.imsi,
          email: emailAddress,
          subscriberStatus: subscriberStatuses[subscriberStatus],
          statusDate,
          statusDescription,
          billingAccountNumber,
          banStatus,
          firstName: name?.firstName,
          lastName: name?.lastName,
          userName: getNames(name?.firstName, name?.lastName),
          accountName: getNames(accountName?.firstName, accountName?.lastName),
          accountType,
          accountSubType,
          archived
        };
      });
    }
  }
  // global.console.log('processSearchResults fired');
  return results;
};
const AuthenticationComponent = _ref => {
  let {
    properties,
    authenticated,
    datasources,
    landingBoard,
    data
  } = _ref;
  function usePrevious(value) {
    const ref = (0, _react.useRef)();
    (0, _react.useEffect)(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const location = (0, _reactRouterDom.useLocation)();
  const {
    profiles = {},
    accountSubTypes = {},
    bypassOptionsMetadata
  } = data?.data;
  const {
    onAuthRouteTo,
    subscriberStatuses,
    accountTypeRestrictions,
    workflows = {},
    authSuccessEvent,
    authDeniedEvent
  } = properties;
  const [searchResults, setSearchResults] = (0, _react.useState)([]);
  const [enableBackButton, setEnableBackButton] = (0, _react.useState)(false);
  const {
    backButtonString = 'Back'
  } = properties;
  const [searchType, setSearchType] = (0, _react.useState)('');
  const [selectedRow, setSelectedRow] = (0, _react.useState)();
  const [searchError, setSearchError] = (0, _react.useState)('');
  const [authError, setAuthError] = (0, _react.useState)('');
  const [searchParameter, setSearchParameter] = (0, _react.useState)('');
  const [ctn, setCtn] = (0, _react.useState)();
  const [ban, setBan] = (0, _react.useState)();
  let {
    asapId
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
  const prevResult = usePrevious({
    searchResults
  });
  const handleSecurityQuestionResponse = (successStates, errorStates, value, ban) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const selection = value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const reponse = eventData?.event.data.data;
        selection.question = reponse?.question;
        selection.questionCode = reponse?.questionCode;
        selection.billingAccountNumber = ban;
        setAuthError('');
        setSelectedRow(selection);
      }
      if (isFailure) {
        selection.billingAccountNumber = ban;
        setSelectedRow(selection);
        setAuthError('');
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleAuthClick = async (value, ban, ctn) => {
    setEnableBackButton(true);
    const selection = value;
    setBan(ban);
    setCtn(ctn);
    if (selection?.length > 0 && selection[0].banStatus === 'T') {
      selection.billingAccountNumber = ban;
      setSelectedRow(selection);
    } else {
      const {
        workflow,
        datasource,
        successStates,
        errorStates
      } = workflows?.securityQuestion;
      const submitEvent = 'SUBMIT';
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleSecurityQuestionResponse(successStates, errorStates, value, ban, ctn), {});
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
              targetAccount: ban
            }
          }
        }
      });
    }
  };
  const handleSearchContactClick = async (value, ctn) => {
    const selection = value;
    setSelectedRow(selection);
    setCtn(ctn);
    _componentCache.cache.put('contact', true);
    _componentMessageBus.MessageBus.send(INTERACTION_INIT_EVENT, {
      header: {
        source: 'Voice',
        event: INTERACTION_INIT_EVENT
      },
      body: {
        ctn,
        interactionSource: 'Voice'
      }
    });
  };
  const resetAuthClicked = () => {
    setSelectedRow();
  };
  const showDynamic = searchResults.length > 0;
  const refactorStatus = status => {
    console.log(status);
    switch (status) {
      case 'A':
        return 'ACTIVE';
      case 'S':
        return 'SUSPENDED';
      case 'C':
        return 'CANCELED';
      default:
        return null;
    }
  };
  (0, _react.useEffect)(() => {
    if (location?.state?.routeData?.searchData) {
      setSearchResults([]);
      setSelectedRow(false);
      setAuthError('');
      setSearchType(location?.state?.routeData?.searchType);
      setSearchResults(processSearchResults(location?.state?.routeData?.searchData, subscriberStatuses, location?.state?.routeData?.searchType));
      window[window.sessionStorage?.tabId].NEW_BAN = null;
      window[window.sessionStorage?.tabId].NEW_CTN = null;
      window[sessionStorage.tabId].conversationId = window[sessionStorage.tabId]?.sessionConversationId;
      window[window.sessionStorage?.tabId].authenticated = false;
      if (window[window.sessionStorage?.tabId].unauthenticate) {
        window[window.sessionStorage?.tabId].unauthenticate();
      }
    } else if (location?.state?.routeData?.custAuth) {
      const params = location?.state?.routeData?.custAuth;
      sessionStorage.removeItem('custAuth');
      const newValue = {
        key: 0,
        billingAccountNumber: params?.ban,
        ...params
      };
      const selection = [];
      selection.bypassOnly = true;
      selection.question = '';
      selection.questionCode = '';
      selection.billingAccountNumber = params?.ban;
      selection.push(newValue);
      setSelectedRow(selection);
      setSearchType(location?.state?.routeData?.searchType);
      setSearchResults([{
        ...newValue
      }]);
      document.title = 'Account - Voyage';
      setBan(params?.ban);
      setCtn(params?.ctn);
    } else if (location?.state?.routeData?.imeiData) {
      const imeiParams = location?.state?.routeData?.imeiData;
      const refactoredStatus = refactorStatus(imeiParams?.subscriberStatus);
      sessionStorage.removeItem('imeiData');
      const newValue = {
        key: 0,
        firstName: imeiParams?.name?.firstName,
        lastName: imeiParams?.name?.lastName,
        userName: getNames(imeiParams?.name?.firstName, imeiParams?.name?.lastName),
        accountName: getNames(imeiParams?.accountName?.firstName, imeiParams?.accountName?.lastName),
        imsi: imeiParams?.device?.imsi,
        billingAccountNumber: imeiParams?.billingAccountNumber,
        ctn: imeiParams?.ctn,
        email: imeiParams?.emailAddress,
        device: imeiParams?.device?.model,
        subscriberStatus: refactoredStatus,
        sim: imeiParams?.device?.iccid,
        imei: imeiParams?.device?.imei,
        accountSubType: imeiParams?.accountSubType,
        accountType: imeiParams?.accountType,
        archived: imeiParams?.archived,
        banStatus: imeiParams?.banStatus
      };
      const selection = [];
      selection.question = '';
      selection.questionCode = '';
      selection.billingAccountNumber = imeiParams?.billingAccountNumber;
      selection.push(newValue);
      setSearchResults(selection);
      setSearchType(location?.state?.routeData?.searchType);
      setSearchResults([{
        ...newValue
      }]);
      setBan(imeiParams?.billingAccountNumber);
      setCtn(imeiParams?.ctn);
    }
  }, [location?.key]);
  const handleBackClick = () => {
    resetAuthClicked();
    setEnableBackButton(false);
  };
  return /*#__PURE__*/_react.default.createElement("div", null, !authenticated && /*#__PURE__*/_react.default.createElement("div", {
    className: "caller-container"
  }, showDynamic && /*#__PURE__*/_react.default.createElement("div", {
    className: "caller-container__dynamic"
  }, searchType == 'Contact' && (!selectedRow ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContactSearchList.default, {
    data: searchResults,
    profiles: profiles,
    accountSubTypes: accountSubTypes,
    onClick: handleSearchContactClick,
    searchParameter: searchParameter
  })) : /*#__PURE__*/_react.default.createElement("div", null, "Creating Interaction... Please wait")), searchType == 'Account' && (!selectedRow ? /*#__PURE__*/_react.default.createElement(_SearchList.default, {
    data: searchResults,
    profiles: profiles,
    accountSubTypes: accountSubTypes,
    onClick: handleAuthClick,
    searchParameter: searchParameter,
    datasources: datasources
  }) : /*#__PURE__*/_react.default.createElement(_SecurityQuestion.default, {
    data: selectedRow,
    workflows: workflows,
    onCancel: resetAuthClicked,
    onAuthRouteTo: onAuthRouteTo,
    bypassOptionsMetadata: bypassOptionsMetadata,
    datasources: datasources,
    landingBoard: landingBoard,
    authSuccessEvent: authSuccessEvent,
    authDeniedEvent: authDeniedEvent,
    profiles: profiles,
    ban: ban,
    ctn: ctn,
    enableBackButton: enableBackButton,
    backButtonString: backButtonString,
    handleBackClick: handleBackClick
  })), authError !== '' && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: authError,
    type: "error"
  }))));
};
var _default = AuthenticationComponent;
exports.default = _default;
module.exports = exports.default;