import React from 'react';
import { Checkbox, Row, Col } from 'antd';

const SEARCH_LIST_KEYS = [
    'subscriberStatus',
    'firstName',
    'lastName',
    'billingAccountNumber',
    'ctn',
];

const transformWordToCapitalize = (word) => {
    if (word === '') return word
    if (word === 'email') word = 'e-mail'
    return `${word[0].toUpperCase()}${word.slice(1)}`
}

function ColumnFilter({
    columns,
    filters,
    setColumns,
    filteredColumns,
    setFilteredColumns,
}) {
    const handleFilterChange = (checkedValues) => {
        const keysToBeDisplayed = [...SEARCH_LIST_KEYS, ...checkedValues];

        const updatedColumns = columns.filter((col) =>
            keysToBeDisplayed.includes(col.dataIndex)
        );

        setTimeout(() => {
            setFilteredColumns(checkedValues);
        }, 100);

        setTimeout(() => {
            setColumns(updatedColumns);
        }, 200);
    };

    return (
        <div>
            <Checkbox.Group
                style={{ width: '100%' }}
                onChange={handleFilterChange}
                value={filteredColumns}
            >
                <Row>
                    {filters.map(filter => {
                        return <Col span={12}><Checkbox value={filter}>{transformWordToCapitalize(filter)}</Checkbox></Col>
                    })}
                </Row>
            </Checkbox.Group>
        </div>
    );
}

export default ColumnFilter;
