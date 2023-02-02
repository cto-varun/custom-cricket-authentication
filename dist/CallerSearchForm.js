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
const FilterTag = props => {
  const {
    label,
    closable,
    onClose
  } = props;
  return /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    closable: closable,
    onClose: onClose,
    style: {
      marginRight: 3
    }
  }, label);
};
const options = [{
  value: 'emailAddress',
  label: 'Email'
}, {
  value: 'ctn',
  label: 'CTN'
}, {
  value: 'billingAccountNumber',
  label: 'BAN'
}, {
  value: 'orderId',
  label: 'Order ID'
}, {
  value: 'imei',
  label: 'IMEI'
}, {
  value: 'iccid',
  label: 'SIM'
}, {
  value: 'firstName',
  label: 'First Name'
}, {
  value: 'lastName',
  label: 'Last Name'
}];
const CallerSearchForm = _ref => {
  let {
    handleSearchClick
  } = _ref;
  const [form] = _antd.Form.useForm();
  const [searchCtn, setSearchCtn] = (0, _react.useState)(window[window.sessionStorage?.tabId].NEW_CTN);
  const [initialFormValues, setInitialFormValues] = (0, _react.useState)(undefined);
  const [selectData, setSelectData] = (0, _react.useState)([]);
  const handleChangeFilter = res => {
    if (res.length > selectData.length) {
      if (selectData.length && !selectData[selectData.length - 1].value) {
        const updatedData = selectData.map((item, i, arr) => {
          if (i === arr.length - 1) {
            return {
              ...item,
              value: res[res.length - 1]
            };
          }
          return item;
        });
        setSelectData(updatedData);
      } else {
        const optionData = options.find(opt => opt.value === res[res.length - 1]);
        if (optionData) {
          setSelectData([...selectData, {
            type: optionData
          }]);
        }
      }
    }
  };
  const handleRemoveFilter = label => {
    const [typeLabel] = label.split(' = ');
    const result = selectData.filter(item => item.type.label !== typeLabel);
    setSelectData(result);
  };
  const searchOnClick = () => {
    if (selectData.length > 0) {
      handleSearchClick(selectData);
    }
  };
  (0, _react.useEffect)(() => {
    window[window.sessionStorage?.tabId].setSearchCtn = setSearchCtn;
    return () => {
      delete window[window.sessionStorage?.tabId].setSearchCtn;
    };
  });
  (0, _react.useEffect)(() => {
    setSearchCtn(window[window.sessionStorage?.tabId].NEW_CTN);
  }, []);
  (0, _react.useEffect)(() => {
    if (typeof searchCtn !== 'undefined') {
      setSelectData([{
        type: {
          value: 'ctn',
          label: 'CTN'
        },
        value: searchCtn
      }]);
    }
  }, [searchCtn]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    mode: "tags",
    className: "search-box-select",
    dropdownMatchSelectWidth: 50,
    allowClear: true,
    placeholder: "Type search parameter (i.e. Order Id, CTN, BAN)...",
    value: selectData.map(opt => `${opt.type?.label} = ${opt.value || ''}`),
    onChange: handleChangeFilter,
    style: {
      width: '100%'
    },
    options: options,
    tagRender: props => /*#__PURE__*/_react.default.createElement(FilterTag, _extends({}, props, {
      onClose: e => {
        handleRemoveFilter(props.label);
        props.onClose(e);
      }
    }))
  }), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    htmlType: "submit",
    onClick: searchOnClick
  }, "Search"));
};
var _default = CallerSearchForm;
exports.default = _default;
module.exports = exports.default;