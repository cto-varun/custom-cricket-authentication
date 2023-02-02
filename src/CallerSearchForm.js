import React, { useState, useEffect } from 'react';
import { Select, Button, Form, Tag } from 'antd';

const FilterTag = (props) => {
    const { label, closable, onClose } = props;

    return (
        <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
            {label}
        </Tag>
    );
};

const options = [
    {
        value: 'emailAddress',
        label: 'Email',
    },
    {
        value: 'ctn',
        label: 'CTN',
    },
    {
        value: 'billingAccountNumber',
        label: 'BAN',
    },
    {
        value: 'orderId',
        label: 'Order ID',
    },
    {
        value: 'imei',
        label: 'IMEI',
    },
    {
        value: 'iccid',
        label: 'SIM',
    },
    {
        value: 'firstName',
        label: 'First Name',
    },
    {
        value: 'lastName',
        label: 'Last Name',
    },
];

const CallerSearchForm = ({ handleSearchClick }) => {
    const [form] = Form.useForm();
    const [searchCtn, setSearchCtn] = useState(window[window.sessionStorage?.tabId].NEW_CTN);
    const [initialFormValues, setInitialFormValues] = useState(undefined);
    const [selectData, setSelectData] = useState([]);

    const handleChangeFilter = (res) => {
        if (res.length > selectData.length) {
            if (selectData.length && !selectData[selectData.length - 1].value) {
                const updatedData = selectData.map((item, i, arr) => {
                    if (i === arr.length - 1) {
                        return { ...item, value: res[res.length - 1] };
                    }
                    return item;
                });
                setSelectData(updatedData);
            } else {
                const optionData = options.find(
                    (opt) => opt.value === res[res.length - 1]
                );
                if (optionData) {
                    setSelectData([
                        ...selectData,
                        {
                            type: optionData,
                        },
                    ]);
                }
            }
        }
    };

    const handleRemoveFilter = (label) => {
        const [typeLabel] = label.split(' = ');
        const result = selectData.filter(
            (item) => item.type.label !== typeLabel
        );
        setSelectData(result);
    };

    const searchOnClick = () => {
        if (selectData.length > 0) {
            handleSearchClick(selectData);
        }
    };

    useEffect(() => {
        window[window.sessionStorage?.tabId].setSearchCtn = setSearchCtn;
        return () => {
            delete window[window.sessionStorage?.tabId].setSearchCtn;
        };
    });

    useEffect(() => {
        setSearchCtn(window[window.sessionStorage?.tabId].NEW_CTN);
    }, []);

    useEffect(() => {
        if (typeof searchCtn !== 'undefined') {
            setSelectData([
                { type: { value: 'ctn', label: 'CTN' }, value: searchCtn },
            ]);
        }
    }, [searchCtn]);

    return (
        <>
            <Select
                mode="tags"
                className="search-box-select"
                dropdownMatchSelectWidth={50}
                allowClear
                placeholder="Type search parameter (i.e. Order Id, CTN, BAN)..."
                value={selectData.map(
                    (opt) => `${opt.type?.label} = ${opt.value || ''}`
                )}
                onChange={handleChangeFilter}
                style={{ width: '100%' }}
                options={options}
                tagRender={(props) => (
                    <FilterTag
                        {...props}
                        onClose={(e) => {
                            handleRemoveFilter(props.label);
                            props.onClose(e);
                        }}
                    />
                )}
            />
            <Button htmlType="submit" onClick={searchOnClick}>
                Search
            </Button>
        </>
    );
};

export default CallerSearchForm;
