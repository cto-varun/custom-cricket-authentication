"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const formatMaskedInput = function () {
  let value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    newValue,
    isNumber = false
  } = value;
  let inputVal = newValue;
  if (isNumber) {
    inputVal = inputVal.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  }
  let unmasked = value?.unmasked && inputVal.length > 0 ? value.unmasked : inputVal;
  let masked = '';
  if (inputVal.length > unmasked.length) {
    unmasked = unmasked + inputVal.substring(unmasked.length);
  } else if (inputVal.length < unmasked.length) {
    unmasked = unmasked.substring(0, inputVal.length);
  }
  unmasked.split('').forEach((c, i) => masked = masked + '\u2022');
  return {
    unmasked,
    masked
  };
};
const MaskedInput = _ref => {
  let {
    value = {},
    onChange,
    allowClear = true,
    isNumber = false,
    ...restProps
  } = _ref;
  const [displayMasked, setDisplayMasked] = (0, _react.useState)(false);
  const onValueChange = e => {
    if (e.target.value === '') {
      setDisplayMasked(false);
    }
    onChange(formatMaskedInput({
      ...value,
      newValue: e.target.value?.replace(/\s/g, ''),
      isNumber
    }));
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Input, _extends({
    className: "fs-exclude"
  }, restProps, {
    value: displayMasked ? value?.masked : value?.unmasked,
    onBlur: () => {
      setDisplayMasked(true);
    },
    onChange: e => onValueChange(e),
    allowClear: allowClear
  }));
};
var _default = MaskedInput;
exports.default = _default;
module.exports = exports.default;