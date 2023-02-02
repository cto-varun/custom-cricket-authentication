import React from 'react';
import {
    Typography,
} from 'antd';
const { Text } = Typography;

const renderTitle = (title, className="") => {
    return (
        <>
            <Text className={className}>{title?.toUpperCase()}</Text>
        </>
    );
};

export default renderTitle;

