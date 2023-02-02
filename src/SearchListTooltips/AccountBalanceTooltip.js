import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, Typography, Spin, notification } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import { MessageBus } from '@ivoyant/component-message-bus';

const { Text } = Typography;

function AccountBalanceTooltip({ datasources, ban, index, record }) {
    const datasource = '360-get-search-list-balance';
    const successStates = ['success'];
    const errorStates = ['error'];
    const responseMapping = {
        error: {
            messageExpr:
                "(error.response.data ? error.response.data.causedBy[0].message : error.response.statusText ? ' : ' & error.response.statusText : '')",
        },
    };

    const [tooltipLoading, setTooltipLoading] = useState(true);

    const accountBalance = useRef(null);
    const dueImmidiately = useRef(null);
    const dueAmount = useRef(null);

    const handleAccountBalanceResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                // set loading states
                setTimeout(() => {
                    accountBalance.current =
                        parseInt(
                            eventData?.event?.data?.data?.accountDetails
                                ?.balances?.accountBalance
                        ) > 0
                            ? eventData?.event?.data?.data?.accountDetails
                                  ?.balances?.accountBalance
                            : 0;
                    dueImmidiately.current =
                        parseInt(
                            eventData?.event?.data?.data?.accountDetails
                                ?.balances?.dueImmediately
                        ) > 0
                            ? eventData?.event?.data?.data?.accountDetails
                                  ?.balances?.dueImmediately
                            : 0;
                    dueAmount.current =
                        eventData?.event?.data?.data?.accountDetails?.balances?.dueAmount;
                    setTimeout(() => {
                        setTooltipLoading(false);
                    }, 200);
                }, 100);
            }

            if (isFailure) {
                notification.error(
                    'Error fetching account balances, please try again!'
                );
                setTimeout(() => {
                    setTooltipLoading(false);
                }, 200);
            }

            // unsubscribe to API call
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const fetchAccountBalances = () => {
        setTooltipLoading(true);

        // data fetch here
        const workflow = `FETCHACCOUNTBALANCE`;
        const registrationId = `${workflow}_${ban}_${index}`;

        // init workflow
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'INIT',
            },
        });

        // subscribe to workflow
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleAccountBalanceResponse(successStates, errorStates)
        );

        // replace accountId with BAN in URL config
        const baseUri = datasources[datasource].baseUri.replace(
            '{accountId}',
            ban.toString()
        );
        const url = datasources[datasource].url.replace(
            '{accountId}',
            ban.toString()
        );

        // submit call
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: {
                    ...datasources[datasource],
                    baseUri,
                    url,
                },
                request: {},
                responseMapping,
            },
        });
    };

    const checkDataAndFetch = () => {
        /* 
            !No optimization using refs, refetch on each hover
        */
        fetchAccountBalances();

        /*
            !Optimization stuff below
        */
        // if (
        //     accountBalance.current === null ||
        //     dueImmidiately.current === null
        // ) {
        //     // !Fetch Account balance
        //     fetchAccountBalances();
        // } else {
        //     // ! Leaving this else part for readability
        //     // console.log('No fetch, data, is not null', {
        //     //     accountBalance,
        //     //     dueImmidiately,
        //     //     tooltipLoading,
        //     // });
        // }
    };

    return (
        <div onMouseEnter={checkDataAndFetch}>
            <Tooltip
                className="search-list-tooltip"
                color="#000"
                placement="right"
                title={
                    <Spin spinning={tooltipLoading}>
                        {tooltipLoading ? (
                            <Text style={{ color: 'white' }}>
                                Fetching data...
                            </Text>
                        ) : (
                            <Text style={{ color: 'white' }}>
                                {/* Replace $0 with data from API - normalize it */}
                                <Text
                                    style={{ display: 'block', color: 'white' }}
                                >
                                    Amount Due:{' '}
                                    <Text strong style={{ color: 'white' }}>
                                        ${dueAmount.current}
                                    </Text>
                                </Text>
                                {/* <Text
                                    style={{ display: 'block', color: 'white' }}
                                >
                                    Account Balance:{' '}
                                    <Text strong style={{ color: 'white' }}>
                                        ${accountBalance.current}
                                    </Text>
                                </Text> */}
                                Due Immediately:{' '}
                                <Text strong style={{ color: 'white' }}>
                                    $
                                    {record?.banStatus === 'O'
                                        ? accountBalance.current
                                        : dueImmidiately.current}
                                </Text>
                            </Text>
                        )}
                    </Spin>
                }
            >
                <DollarCircleOutlined />
            </Tooltip>
        </div>
    );
}

export default AccountBalanceTooltip;
