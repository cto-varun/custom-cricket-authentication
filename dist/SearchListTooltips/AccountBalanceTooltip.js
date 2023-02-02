"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Text
} = _antd.Typography;
function AccountBalanceTooltip(_ref) {
  let {
    datasources,
    ban,
    index,
    record
  } = _ref;
  const datasource = '360-get-search-list-balance';
  const successStates = ['success'];
  const errorStates = ['error'];
  const responseMapping = {
    error: {
      messageExpr: "(error.response.data ? error.response.data.causedBy[0].message : error.response.statusText ? ' : ' & error.response.statusText : '')"
    }
  };
  const [tooltipLoading, setTooltipLoading] = (0, _react.useState)(true);
  const accountBalance = (0, _react.useRef)(null);
  const dueImmidiately = (0, _react.useRef)(null);
  const dueAmount = (0, _react.useRef)(null);
  const handleAccountBalanceResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        // set loading states
        setTimeout(() => {
          accountBalance.current = parseInt(eventData?.event?.data?.data?.accountDetails?.balances?.accountBalance) > 0 ? eventData?.event?.data?.data?.accountDetails?.balances?.accountBalance : 0;
          dueImmidiately.current = parseInt(eventData?.event?.data?.data?.accountDetails?.balances?.dueImmediately) > 0 ? eventData?.event?.data?.data?.accountDetails?.balances?.dueImmediately : 0;
          dueAmount.current = eventData?.event?.data?.data?.accountDetails?.balances?.dueAmount;
          setTimeout(() => {
            setTooltipLoading(false);
          }, 200);
        }, 100);
      }
      if (isFailure) {
        _antd.notification.error('Error fetching account balances, please try again!');
        setTimeout(() => {
          setTooltipLoading(false);
        }, 200);
      }

      // unsubscribe to API call
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const fetchAccountBalances = () => {
    setTooltipLoading(true);

    // data fetch here
    const workflow = `FETCHACCOUNTBALANCE`;
    const registrationId = `${workflow}_${ban}_${index}`;

    // init workflow
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });

    // subscribe to workflow
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleAccountBalanceResponse(successStates, errorStates));

    // replace accountId with BAN in URL config
    const baseUri = datasources[datasource].baseUri.replace('{accountId}', ban.toString());
    const url = datasources[datasource].url.replace('{accountId}', ban.toString());

    // submit call
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: {
          ...datasources[datasource],
          baseUri,
          url
        },
        request: {},
        responseMapping
      }
    });
  };
  const checkDataAndFetch = () => {
    /* 
        !No optimization using refs, refetch on each hover
    */
    fetchAccountBalances();

    /*
        !Optimization stuff below
    */
    // if (
    //     accountBalance.current === null ||
    //     dueImmidiately.current === null
    // ) {
    //     // !Fetch Account balance
    //     fetchAccountBalances();
    // } else {
    //     // ! Leaving this else part for readability
    //     // console.log('No fetch, data, is not null', {
    //     //     accountBalance,
    //     //     dueImmidiately,
    //     //     tooltipLoading,
    //     // });
    // }
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    onMouseEnter: checkDataAndFetch
  }, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    className: "search-list-tooltip",
    color: "#000",
    placement: "right",
    title: /*#__PURE__*/_react.default.createElement(_antd.Spin, {
      spinning: tooltipLoading
    }, tooltipLoading ? /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        color: 'white'
      }
    }, "Fetching data...") : /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        color: 'white'
      }
    }, /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        display: 'block',
        color: 'white'
      }
    }, "Amount Due:", ' ', /*#__PURE__*/_react.default.createElement(Text, {
      strong: true,
      style: {
        color: 'white'
      }
    }, "$", dueAmount.current)), "Due Immediately:", ' ', /*#__PURE__*/_react.default.createElement(Text, {
      strong: true,
      style: {
        color: 'white'
      }
    }, "$", record?.banStatus === 'O' ? accountBalance.current : dueImmidiately.current)))
  }, /*#__PURE__*/_react.default.createElement(_icons.DollarCircleOutlined, null)));
}
var _default = AccountBalanceTooltip;
exports.default = _default;
module.exports = exports.default;