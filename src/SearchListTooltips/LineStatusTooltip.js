import React from 'react';
import { Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';

const timezone = 'America/New_York'; // This should ideally come from config
const dataTZ = 'America/Chicago'; // This should ideally come from config

const { Text } = Typography;

function LineStatusTooltip({ text, record, subscriberStatusConfig }) {
    const subscriberStatus = record?.subscriberStatus;
    const statusDate = record?.statusDate;
    const statusDescription = record?.statusDescription;
    const promptText =
        subscriberStatusConfig[subscriberStatus?.toUpperCase()]?.promptText;
    const statusColor =
        subscriberStatusConfig[subscriberStatus?.toUpperCase()]?.color;

    const getDate = (val, date) => {
        if (val) {
            const time =
                val + -1 * new moment(date).tz(dataTZ).utcOffset() * 60 * 1000;
            return moment(time).tz(timezone);
        }
        return moment();
    };

    return (
        <Text>
            {text}{' '}
            {text?.toString()?.length > 0 && (
                <Tooltip
                    className="search-list-tooltip"
                    color="#000"
                    placement="right"
                    title={
                        <Text style={{ color: 'white' }}>
                            <Text
                                style={{
                                    display: 'block',
                                    color: 'white',
                                }}
                            >
                                <Text
                                    strong
                                    style={{ color: `${statusColor}` }}
                                >
                                    {subscriberStatus}
                                </Text>
                                {statusDescription !== undefined && (
                                    <Text style={{ color: 'white' }}>
                                        : {statusDescription}
                                    </Text>
                                )}
                            </Text>
                            {/* Replace new Date() with the data from API */}
                            {promptText} on:{' '}
                            <Text strong style={{ color: 'white' }}>
                                {/* {new Date(statusDate).toLocaleDateString()} */}
                                {/* {moment(new Date(statusDate))
                                    .tz(timezone)
                                    .format('Do MMM YYYY')} */}
                                {getDate(
                                    new Date(statusDate).getTime(),
                                    new Date(statusDate)
                                ).format('Do MMM YYYY')}
                            </Text>
                        </Text>
                    }
                >
                    <InfoCircleOutlined style={{ color: `${statusColor}` }} />
                </Tooltip>
            )}
        </Text>
    );
}

export default LineStatusTooltip;
