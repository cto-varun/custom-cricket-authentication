import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Button,
    Table,
    Typography,
    Space,
    Alert,
    Tooltip,
    Popover,
} from 'antd';
import {
    UndoOutlined,
    ContainerOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import ReactDragListView from 'react-drag-listview';
import renderTitle from './renderTitle';

// components
import ColumnFilter from './ColumnFilter';

// tooltips
import AccountBalanceTooltip from './SearchListTooltips/AccountBalanceTooltip';
import LineStatusTooltip from './SearchListTooltips/LineStatusTooltip';

const { Text } = Typography;
const titleClassName = "search-table-col-title";

const SUBSCRIBER_STATUS_CONFIG = {
    ACTIVE: { promptText: 'Activated', color: '#52c41a' },
    SUSPENDED: { promptText: 'Suspended', color: '#fa8c16' },
    CANCELLED: { promptText: 'Cancelled', color: '#f5222d' },
};

// FLAG TO TOGGLE NEW/OLD Search view
// const SHOW_OLD_VIEW = true;
const SHOW_OLD_VIEW = false;

const SearchList = ({
    data,
    profiles,
    accountSubTypes,
    onClick,
    searchParameter,
    datasources,
}) => {
    const INIT_COLUMNS_OLD = [
        {
            title: 'User Name',
            dataIndex: 'userName',
        },
        {
            title: 'Account Name',
            dataIndex: 'accountName',
        },
        {
            title: 'BAN',
            dataIndex: 'billingAccountNumber',
        },
        {
            title: 'CTN',
            dataIndex: 'ctn',
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
        },
        {
            title: 'Device',
            dataIndex: 'device',
        },
        {
            title: 'Subscriber Status',
            dataIndex: 'subscriberStatus',
        },
        {
            title: 'SIM',
            dataIndex: 'sim',
        },
        {
            title: 'IMEI',
            dataIndex: 'imei',
        },
        {
            title: 'IMSI',
            dataIndex: 'imsi',
        },
    ];

    const INIT_COLUMNS = [
        {
            key: 'subStatus',
            title: <></>,
            dataIndex: 'subscriberStatus',
            width: 30,
            render: (text) => (
                <div
                    className={`sub-status-sider sub-status-sider-${text?.toLowerCase()}`}
                />
            ),
        },
        {
            title: renderTitle('User Name', titleClassName),
            dataIndex: 'userName',
        },
        {
            title: renderTitle('Account Name', titleClassName),
            dataIndex: 'accountName',
        },
        {
            title: renderTitle('BAN', titleClassName),
            dataIndex: 'billingAccountNumber',
            applyFilter: true,
            filterLabel: 'BAN',
            render: (text, record, index) => (
                <Text style={{ display: 'flex', gap: '5px' }}>
                    {text}{' '}
                    <AccountBalanceTooltip
                        datasources={datasources}
                        ban={text}
                        index={index}
                        record={record}
                    />
                </Text>
            ),
        },
        {
            title: renderTitle('CTN', titleClassName),
            dataIndex: 'ctn',
            applyFilter: true,
            filterLabel: 'CTN',
            render: (text, record) => (
                <LineStatusTooltip
                    text={text}
                    record={record}
                    subscriberStatusConfig={SUBSCRIBER_STATUS_CONFIG}
                />
            ),
        },
        {
            title: renderTitle('E-mail', titleClassName),
            dataIndex: 'email',
        },
        {
            title: renderTitle('Device', titleClassName),
            dataIndex: 'device',
        },
        {
            title: renderTitle('Subscriber Status', titleClassName),
            dataIndex: 'subscriberStatus',
        },
        {
            title: renderTitle('SIM', titleClassName),
            dataIndex: 'sim',
        },
        {
            title: renderTitle('IMEI', titleClassName),
            dataIndex: 'imei',
        },
        {
            title: renderTitle('IMSI', titleClassName),
            dataIndex: 'imsi',
        },
    ];

    const INIT_FILTERS = ['email', 'device', 'sim', 'imei', 'imsi'];

    const [selectedRow, setSelectedRow] = useState();
    const [selectedBan, setSelectedBan] = useState();
    const [selectedCtn, setSelectedCtn] = useState();
    const [errorMsg, setErrorMsg] = useState(undefined);
    const [selectedRowKeys, setSelectedRowKeys] = useState();
    const [tableData, setTableData] = useState(data);
    const [columns, setColumns] = useState(
        SHOW_OLD_VIEW ? INIT_COLUMNS_OLD : INIT_COLUMNS
    );
    const [showColumnFilter, setShowColumnFilter] = useState(false);
    const [filteredColumns, setFilteredColumns] = useState(INIT_FILTERS);

    useEffect(() => {
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
        ignoreSelector: 'td .sub-status-sider',
    };

    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (selectedRowIndex, selectedRows) => {
            setSelectedRowKeys(selectedRowIndex);
            const accountType = data[selectedRowIndex].accountType;
            const accountSubType = data[selectedRowIndex].accountSubType;
            const archived = data[selectedRowIndex].archived;
            const allowedAccountSubTypes = profiles?.categories
                ?.find(
                    (c) =>
                        c.name ===
                        window[window.sessionStorage?.tabId].COM_IVOYANT_VARS
                            .profile
                )
                ?.categories?.find((c) => c.name === 'allowedAccountSubTypes')
                ?.accountSubTypes;
            if (
                allowedAccountSubTypes &&
                allowedAccountSubTypes.length &&
                !allowedAccountSubTypes.includes(accountSubType)
            ) {
                const accountSubTypeDesc = accountSubTypes?.find(
                    (as) => as.name === accountSubType
                )?.description;
                setErrorMsg(
                    'You are not authorized to access ' +
                        (accountSubTypeDesc
                            ? accountSubTypeDesc + ' account'
                            : 'this account type')
                );
            } else if (archived) {
                setErrorMsg(
                    'This account is archived. Please select a different account. If this is for new service, please create an account.'
                );
            } else {
                setErrorMsg(undefined);
                setSelectedRow(selectedRows);
                setSelectedBan(data[selectedRowIndex].billingAccountNumber);
                setSelectedCtn(data[selectedRowIndex].ctn);
            }
        },
    };

    return (
        <>
            <Row>
                {errorMsg && (
                    <Col>
                        <Space>
                            <Alert message={errorMsg} type="error" />
                        </Space>
                    </Col>
                )}
            </Row>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: '5px' }}
            >
                {SHOW_OLD_VIEW && (
                    <Col>
                        <Text>
                            {data.length} results (Parameter(s):{' '}
                            {searchParameter})
                        </Text>
                    </Col>
                )}

                {!SHOW_OLD_VIEW && (
                    <Col span={20}>
                        <Text>
                            {/* {data.length} results (Parameter(s): {searchParameter}) */}
                            <ContainerOutlined style={{ fontSize: '16px' }} />{' '}
                            <Text style={{ color: 'darkgreen' }}>
                                {data.length} results found
                            </Text>
                        </Text>
                    </Col>
                )}

                {!SHOW_OLD_VIEW && (
                    <Col span={4} style={{ textAlign: 'right' }}>
                        <Space direction="horizontal" size={10} align="end">
                            <Tooltip
                                title="Reset Default Order"
                                placement="left"
                            >
                                <Button
                                    type="text"
                                    icon={<UndoOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setColumns(INIT_COLUMNS);
                                        setFilteredColumns(INIT_FILTERS);
                                    }}
                                />
                            </Tooltip>
                            <Popover
                                content={
                                    <ColumnFilter
                                        columns={INIT_COLUMNS}
                                        filters={INIT_FILTERS}
                                        setColumns={setColumns}
                                        filteredColumns={filteredColumns}
                                        setFilteredColumns={setFilteredColumns}
                                    />
                                }
                                open={showColumnFilter}
                                placement="bottomRight"
                                overlayStyle={{ maxWidth: '200px' }}
                            >
                                <Button
                                    type="text"
                                    icon={<MoreOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowColumnFilter(!showColumnFilter);
                                    }}
                                />
                            </Popover>
                        </Space>
                    </Col>
                )}
            </Row>
            <Row className="mb">
                <Col span={24}>
                    {SHOW_OLD_VIEW ? (
                        <Table
                            className="caller-search-table"
                            columns={columns}
                            dataSource={data}
                            rowSelection={rowSelection}
                            size="middle"
                            pagination={false}
                            scroll={{ x: 1500, y: 300 }}
                        />
                    ) : (
                        <ReactDragListView.DragColumn {...dragProps}>
                            <Table
                                className="caller-search-table"
                                columns={columns}
                                dataSource={data}
                                rowSelection={rowSelection}
                                size="middle"
                                pagination={false}
                                scroll={{ x: 1500, y: 300 }}
                            />
                        </ReactDragListView.DragColumn>
                    )}
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        type={selectedRow ? 'primary' : 'default'}
                        disabled={!selectedRow}
                        onClick={() =>
                            onClick(selectedRow, selectedBan, selectedCtn)
                        }
                    >
                        Select a line and continue
                    </Button>
                </Col>
            </Row>
        </>
    );
};

export default SearchList;
