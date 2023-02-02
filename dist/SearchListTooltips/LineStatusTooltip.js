"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const timezone = 'America/New_York'; // This should ideally come from config
const dataTZ = 'America/Chicago'; // This should ideally come from config

const {
  Text
} = _antd.Typography;
function LineStatusTooltip(_ref) {
  let {
    text,
    record,
    subscriberStatusConfig
  } = _ref;
  const subscriberStatus = record?.subscriberStatus;
  const statusDate = record?.statusDate;
  const statusDescription = record?.statusDescription;
  const promptText = subscriberStatusConfig[subscriberStatus?.toUpperCase()]?.promptText;
  const statusColor = subscriberStatusConfig[subscriberStatus?.toUpperCase()]?.color;
  const getDate = (val, date) => {
    if (val) {
      const time = val + -1 * new _momentTimezone.default(date).tz(dataTZ).utcOffset() * 60 * 1000;
      return (0, _momentTimezone.default)(time).tz(timezone);
    }
    return (0, _momentTimezone.default)();
  };
  return /*#__PURE__*/_react.default.createElement(Text, null, text, ' ', text?.toString()?.length > 0 && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    className: "search-list-tooltip",
    color: "#000",
    placement: "right",
    title: /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        color: 'white'
      }
    }, /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        display: 'block',
        color: 'white'
      }
    }, /*#__PURE__*/_react.default.createElement(Text, {
      strong: true,
      style: {
        color: `${statusColor}`
      }
    }, subscriberStatus), statusDescription !== undefined && /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        color: 'white'
      }
    }, ": ", statusDescription)), promptText, " on:", ' ', /*#__PURE__*/_react.default.createElement(Text, {
      strong: true,
      style: {
        color: 'white'
      }
    }, getDate(new Date(statusDate).getTime(), new Date(statusDate)).format('Do MMM YYYY')))
  }, /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, {
    style: {
      color: `${statusColor}`
    }
  })));
}
var _default = LineStatusTooltip;
exports.default = _default;
module.exports = exports.default;