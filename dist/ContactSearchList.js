"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Text
} = _antd.Typography;
const ContactSearchList = _ref => {
  let {
    data,
    profiles,
    accountSubTypes,
    onClick,
    searchParameter
  } = _ref;
  const [selectedRow, setSelectedRow] = (0, _react.useState)();
  const [selectedCtn, setSelectedCtn] = (0, _react.useState)();
  const [errorMsg, setErrorMsg] = (0, _react.useState)(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = (0, _react.useState)();
  const [tableData, setTableData] = (0, _react.useState)(data);
  const columns = [{
    title: 'First Name',
    dataIndex: 'firstName'
  }, {
    title: 'Last Name',
    dataIndex: 'lastName'
  }, {
    title: 'Contact Number',
    dataIndex: 'ctn'
  }, {
    title: 'E-mail',
    dataIndex: 'email'
  }, {
    title: 'Created Time',
    dataIndex: 'createdTime'
  }];
  (0, _react.useEffect)(() => {
    setErrorMsg(undefined);
    setSelectedRowKeys();
  }, [data]);
  const rowSelection = {
    type: 'radio',
    selectedRowKeys,
    onChange: (selectedRowIndex, selectedRows) => {
      setSelectedRowKeys(selectedRowIndex);
      setErrorMsg(undefined);
      setSelectedRow(selectedRows);
      setSelectedCtn(data[selectedRowIndex].ctn);
    }
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, null, errorMsg && /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: errorMsg,
    type: "error"
  })))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(Text, null, data.length, " results (Parameter(s): ", searchParameter, ")"))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "mb"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    className: "caller-search-table",
    columns: columns,
    dataSource: data,
    rowSelection: rowSelection,
    size: "middle",
    pagination: false,
    scroll: {
      x: 1500,
      y: 300
    }
  }))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: selectedRow ? 'primary' : 'default',
    disabled: !selectedRow,
    onClick: () => onClick(selectedRow, selectedCtn)
  }, "Create Interaction"))));
};
var _default = ContactSearchList;
exports.default = _default;
module.exports = exports.default;