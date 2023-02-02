"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const SEARCH_LIST_KEYS = ['subscriberStatus', 'firstName', 'lastName', 'billingAccountNumber', 'ctn'];
const transformWordToCapitalize = word => {
  if (word === '') return word;
  if (word === 'email') word = 'e-mail';
  return `${word[0].toUpperCase()}${word.slice(1)}`;
};
function ColumnFilter(_ref) {
  let {
    columns,
    filters,
    setColumns,
    filteredColumns,
    setFilteredColumns
  } = _ref;
  const handleFilterChange = checkedValues => {
    const keysToBeDisplayed = [...SEARCH_LIST_KEYS, ...checkedValues];
    const updatedColumns = columns.filter(col => keysToBeDisplayed.includes(col.dataIndex));
    setTimeout(() => {
      setFilteredColumns(checkedValues);
    }, 100);
    setTimeout(() => {
      setColumns(updatedColumns);
    }, 200);
  };
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Checkbox.Group, {
    style: {
      width: '100%'
    },
    onChange: handleFilterChange,
    value: filteredColumns
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, filters.map(filter => {
    return /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 12
    }, /*#__PURE__*/_react.default.createElement(_antd.Checkbox, {
      value: filter
    }, transformWordToCapitalize(filter)));
  }))));
}
var _default = ColumnFilter;
exports.default = _default;
module.exports = exports.default;