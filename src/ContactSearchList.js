import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Typography, Space, Alert } from 'antd';

const { Text } = Typography;

const ContactSearchList = ({
    data,
    profiles,
    accountSubTypes,
    onClick,
    searchParameter,
}) => {
    const [selectedRow, setSelectedRow] = useState();
    const [selectedCtn, setSelectedCtn] = useState();
    const [errorMsg, setErrorMsg] = useState(undefined);
    const [selectedRowKeys, setSelectedRowKeys] = useState();
    const [tableData, setTableData] = useState(data);

    const columns = [
        {
            title: 'First Name',
            dataIndex: 'firstName',
        },
        {
            title: 'Last Name',
            dataIndex: 'lastName',
        },
        {
            title: 'Contact Number',
            dataIndex: 'ctn',
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
        },
        {
            title: 'Created Time',
            dataIndex: 'createdTime',
        },
    ];

    useEffect(() => {
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
            <Row>
                <Col>
                    <Text>
                        {data.length} results (Parameter(s): {searchParameter})
                    </Text>
                </Col>
            </Row>
            <Row className="mb">
                <Col span={24}>
                    <Table
                        className="caller-search-table"
                        columns={columns}
                        dataSource={data}
                        rowSelection={rowSelection}
                        size="middle"
                        pagination={false}
                        scroll={{ x: 1500, y: 300 }}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        type={selectedRow ? 'primary' : 'default'}
                        disabled={!selectedRow}
                        onClick={() =>
                            onClick(selectedRow, selectedCtn)
                        }
                    >
                        Create Interaction
                    </Button>
                </Col>
            </Row>
        </>
    );
};

export default ContactSearchList;
