"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _reactDragListview = _interopRequireDefault(require("react-drag-listview"));
var _renderTitle = _interopRequireDefault(require("./renderTitle"));
var _ColumnFilter = _interopRequireDefault(require("./ColumnFilter"));
var _AccountBalanceTooltip = _interopRequireDefault(require("./SearchListTooltips/AccountBalanceTooltip"));
var _LineStatusTooltip = _interopRequireDefault(require("./SearchListTooltips/LineStatusTooltip"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// components

// tooltips

const {
  Text
} = _antd.Typography;
const titleClassName = "search-table-col-title";
const SUBSCRIBER_STATUS_CONFIG = {
  ACTIVE: {
    promptText: 'Activated',
    color: '#52c41a'
  },
  SUSPENDED: {
    promptText: 'Suspended',
    color: '#fa8c16'
  },
  CANCELLED: {
    promptText: 'Cancelled',
    color: '#f5222d'
  }
};

// FLAG TO TOGGLE NEW/OLD Search view
// const SHOW_OLD_VIEW = true;
const SHOW_OLD_VIEW = false;
const SearchList = _ref => {
  let {
    data,
    profiles,
    accountSubTypes,
    onClick,
    searchParameter,
    datasources
  } = _ref;
  const INIT_COLUMNS_OLD = [{
    title: 'User Name',
    dataIndex: 'userName'
  }, {
    title: 'Account Name',
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
    title: 'IMSI',
    dataIndex: 'imsi'
  }];
  const INIT_COLUMNS = [{
    key: 'subStatus',
    title: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null),
    dataIndex: 'subscriberStatus',
    width: 30,
    render: text => /*#__PURE__*/_react.default.createElement("div", {
      className: `sub-status-sider sub-status-sider-${text?.toLowerCase()}`
    })
  }, {
    title: (0, _renderTitle.default)('User Name', titleClassName),
    dataIndex: 'userName'
  }, {
    title: (0, _renderTitle.default)('Account Name', titleClassName),
    dataIndex: 'accountName'
  }, {
    title: (0, _renderTitle.default)('BAN', titleClassName),
    dataIndex: 'billingAccountNumber',
    applyFilter: true,
    filterLabel: 'BAN',
    render: (text, record, index) => /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        display: 'flex',
        gap: '5px'
      }
    }, text, ' ', /*#__PURE__*/_react.default.createElement(_AccountBalanceTooltip.default, {
      datasources: datasources,
      ban: text,
      index: index,
      record: record
    }))
  }, {
    title: (0, _renderTitle.default)('CTN', titleClassName),
    dataIndex: 'ctn',
    applyFilter: true,
    filterLabel: 'CTN',
    render: (text, record) => /*#__PURE__*/_react.default.createElement(_LineStatusTooltip.default, {
      text: text,
      record: record,
      subscriberStatusConfig: SUBSCRIBER_STATUS_CONFIG
    })
  }, {
    title: (0, _renderTitle.default)('E-mail', titleClassName),
    dataIndex: 'email'
  }, {
    title: (0, _renderTitle.default)('Device', titleClassName),
    dataIndex: 'device'
  }, {
    title: (0, _renderTitle.default)('Subscriber Status', titleClassName),
    dataIndex: 'subscriberStatus'
  }, {
    title: (0, _renderTitle.default)('SIM', titleClassName),
    dataIndex: 'sim'
  }, {
    title: (0, _renderTitle.default)('IMEI', titleClassName),
    dataIndex: 'imei'
  }, {
    title: (0, _renderTitle.default)('IMSI', titleClassName),
    dataIndex: 'imsi'
  }];
  const INIT_FILTERS = ['email', 'device', 'sim', 'imei', 'imsi'];
  const [selectedRow, setSelectedRow] = (0, _react.useState)();
  const [selectedBan, setSelectedBan] = (0, _react.useState)();
  const [selectedCtn, setSelectedCtn] = (0, _react.useState)();
  const [errorMsg, setErrorMsg] = (0, _react.useState)(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = (0, _react.useState)();
  const [tableData, setTableData] = (0, _react.useState)(data);
  const [columns, setColumns] = (0, _react.useState)(SHOW_OLD_VIEW ? INIT_COLUMNS_OLD : INIT_COLUMNS);
  const [showColumnFilter, setShowColumnFilter] = (0, _react.useState)(false);
  const [filteredColumns, setFilteredColumns] = (0, _react.useState)(INIT_FILTERS);
  (0, _react.useEffect)(() => {
    setErrorMsg(undefined);
    setSelectedRowKeys();
  }, [data]);

  // dragProps
  const dragProps = {
    lineClassName: 'search-list-line-dnd',
    onDragEnd(fromIndex, toIndex) {
      if (fromIndex > 1 && toIndex > 1 && fromIndex !== toIndex) {
        const updatedColumns = [...columns];
        const item = updatedColumns.splice(fromIndex - 1, 1)[0];
        updatedColumns.splice(toIndex - 1, 0, item);
        setColumns(updatedColumns);
      }
    },
    nodeSelector: 'th',
    ignoreSelector: 'td .sub-status-sider'
  };
  const rowSelection = {
    type: 'radio',
    selectedRowKeys,
    onChange: (selectedRowIndex, selectedRows) => {
      setSelectedRowKeys(selectedRowIndex);
      const accountType = data[selectedRowIndex].accountType;
      const accountSubType = data[selectedRowIndex].accountSubType;
      const archived = data[selectedRowIndex].archived;
      const allowedAccountSubTypes = profiles?.categories?.find(c => c.name === window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile)?.categories?.find(c => c.name === 'allowedAccountSubTypes')?.accountSubTypes;
      if (allowedAccountSubTypes && allowedAccountSubTypes.length && !allowedAccountSubTypes.includes(accountSubType)) {
        const accountSubTypeDesc = accountSubTypes?.find(as => as.name === accountSubType)?.description;
        setErrorMsg('You are not authorized to access ' + (accountSubTypeDesc ? accountSubTypeDesc + ' account' : 'this account type'));
      } else if (archived) {
        setErrorMsg('This account is archived. Please select a different account. If this is for new service, please create an account.');
      } else {
        setErrorMsg(undefined);
        setSelectedRow(selectedRows);
        setSelectedBan(data[selectedRowIndex].billingAccountNumber);
        setSelectedCtn(data[selectedRowIndex].ctn);
      }
    }
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, null, errorMsg && /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: errorMsg,
    type: "error"
  })))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    justify: "space-between",
    align: "middle",
    style: {
      marginBottom: '5px'
    }
  }, SHOW_OLD_VIEW && /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(Text, null, data.length, " results (Parameter(s):", ' ', searchParameter, ")")), !SHOW_OLD_VIEW && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 20
  }, /*#__PURE__*/_react.default.createElement(Text, null, /*#__PURE__*/_react.default.createElement(_icons.ContainerOutlined, {
    style: {
      fontSize: '16px'
    }
  }), ' ', /*#__PURE__*/_react.default.createElement(Text, {
    style: {
      color: 'darkgreen'
    }
  }, data.length, " results found"))), !SHOW_OLD_VIEW && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 4,
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    direction: "horizontal",
    size: 10,
    align: "end"
  }, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: "Reset Default Order",
    placement: "left"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "text",
    icon: /*#__PURE__*/_react.default.createElement(_icons.UndoOutlined, null),
    onClick: e => {
      e.stopPropagation();
      setColumns(INIT_COLUMNS);
      setFilteredColumns(INIT_FILTERS);
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    content: /*#__PURE__*/_react.default.createElement(_ColumnFilter.default, {
      columns: INIT_COLUMNS,
      filters: INIT_FILTERS,
      setColumns: setColumns,
      filteredColumns: filteredColumns,
      setFilteredColumns: setFilteredColumns
    }),
    open: showColumnFilter,
    placement: "bottomRight",
    overlayStyle: {
      maxWidth: '200px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "text",
    icon: /*#__PURE__*/_react.default.createElement(_icons.MoreOutlined, null),
    onClick: e => {
      e.stopPropagation();
      setShowColumnFilter(!showColumnFilter);
    }
  }))))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "mb"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, SHOW_OLD_VIEW ? /*#__PURE__*/_react.default.createElement(_antd.Table, {
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
  }) : /*#__PURE__*/_react.default.createElement(_reactDragListview.default.DragColumn, dragProps, /*#__PURE__*/_react.default.createElement(_antd.Table, {
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
  })))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: selectedRow ? 'primary' : 'default',
    disabled: !selectedRow,
    onClick: () => onClick(selectedRow, selectedBan, selectedCtn)
  }, "Select a line and continue"))));
};
var _default = SearchList;
exports.default = _default;
module.exports = exports.default;