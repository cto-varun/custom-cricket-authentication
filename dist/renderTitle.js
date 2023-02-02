"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  Text
} = _antd.Typography;
const renderTitle = function (title) {
  let className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(Text, {
    className: className
  }, title?.toUpperCase()));
};
var _default = renderTitle;
exports.default = _default;
module.exports = exports.default;