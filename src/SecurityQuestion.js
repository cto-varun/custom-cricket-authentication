import React, { useState } from 'react';

import {
    Form,
    Radio,
    Input,
    Typography,
    Select,
    Button,
    Row,
    Col,
    Table,
    Space,
    Alert,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import MaskedInput from './MaskedInput';
import { MessageBus } from '@ivoyant/component-message-bus';
import renderTitle from './renderTitle';
import { v4 as uuid } from 'uuid';

const { Option } = Select;

const { Text } = Typography;

const layout = {
    labelCol: { span: 0 },
    wrapperCol: { span: 18 },
};

// Flag for checkAuthToken
/* Set this flag to TRUE when deploying */
const CHECK_AUTH_TOKEN = true;
/* Set this flag to FALSE when developing */
// const CHECK_AUTH_TOKEN = false;

const OptionBox = ({ description, text, children }) => (
    <div className="radio-option-boxes">
        <Text className="description">{description}</Text>
        <div>
            <Text className="question">{text}</Text>
        </div>
        <div style={{ marginTop: 24 }}>{children}</div>
    </div>
);

const handleOTPSent =
    (successStates, errorStates, setOTPStatus) =>
    (subscriptionId, topic, eventData, closure) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            setOTPStatus('sent');
            MessageBus.unsubscribe(subscriptionId);
        }
    };

const logCustAuthDetails = (authInfo, custAuthLogInfo, isSuccess) => {
    const submitEvent = 'SUBMIT';
    const { datasource, workflow } = custAuthLogInfo;
    const { customerInfo, authMethod, bypassAnswer } = authInfo;
    const { billingAccountNumber } = customerInfo;
    const { attId, asapId, profile } =
        window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
    let firstName;
    let lastName;
    if (customerInfo?.length) {
        firstName = customerInfo[0]?.firstName;
        lastName = customerInfo[0]?.lastName;
    }

    MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
            registrationId: workflow,
            workflow,
            eventType: 'INIT',
        },
    });
    MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
        header: {
            registrationId: workflow,
            workflow,
            eventType: submitEvent,
        },
        body: {
            datasource,
            request: {
                body: {
                    billingAccountNumber,
                    phoneNumber: window[window.sessionStorage?.tabId].NEW_CTN,
                    customerName: {
                        firstName,
                        lastName,
                    },
                    attuid: attId,
                    asapId,
                    profileName: profile,
                    authMethod: authMethod.toUpperCase(),
                    authStatus: isSuccess ? 'SUCCESS' : 'FAILURE',
                    bypassReason: bypassAnswer,
                },
            },
        },
    });
};

const hanldeValidateCustomerResponse =
    (
        successStates,
        errorStates,
        routeOnSuccess,
        history,
        authInfo,
        custAuthLogInfo,
        setIsLoading,
        setErrorMsg,
        authSucessEvent,
        authDeniedEvent,
        ban,
        ctn,
        conversationId
    ) =>
    (subscriptionId, topic, eventData, closure) => {
        const state = eventData.value;
        const authToken = eventData?.event?.data?.data?.token;
        const isSuccess = CHECK_AUTH_TOKEN
            ? successStates.includes(state) &&
              (authToken !== undefined || authToken !== null)
            : successStates.includes(state);
        const isFailure = CHECK_AUTH_TOKEN
            ? errorStates.includes(state) &&
              (authToken === undefined || authToken === null)
            : errorStates.includes(state);
        if (isSuccess || isFailure) {
            // Get the token from API call and send it to authSuccessEvent config
            setIsLoading(false);
            if (isSuccess) {
                window[sessionStorage.tabId].conversationId = conversationId;

                const authSuccessBody = CHECK_AUTH_TOKEN
                    ? {
                          ban,
                          ctn,
                          route: routeOnSuccess,
                          message: 'Customer Authenticated successfully',
                          // Add the auth token here from eventData
                          authToken: authToken,
                      }
                    : {
                          ban,
                          ctn,
                          route: routeOnSuccess,
                          message: 'Customer Authenticated successfully',
                      };

                if (authSucessEvent) {
                    MessageBus.send(authSucessEvent, {
                        header: { source: 'security', event: authSucessEvent },
                        body: authSuccessBody,
                    });
                }
                logCustAuthDetails(authInfo, custAuthLogInfo, isSuccess);
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

const handleGetAuthTokenResponse =
    (
        successStates,
        errorStates,
        routeOnSuccess,
        history,
        authInfo,
        custAuthLogInfo,
        setIsLoading,
        setErrorMsg,
        authSucessEvent,
        authDeniedEvent,
        ban,
        ctn,
        conversationId,
        isAuthBypass
    ) =>
    (subscriptionId, topic, eventData, closure) => {
        const state = eventData.value;
        const authToken = eventData?.event?.data?.data?.token;
        const isSuccess =
            successStates.includes(state) &&
            (authToken !== undefined || authToken !== null);
        const isFailure =
            errorStates.includes(state) &&
            (authToken === undefined || authToken === null);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                // Get the token from API call and send it to authSuccessEvent config
                window[sessionStorage.tabId].conversationId = conversationId;
                if (authSucessEvent) {
                    MessageBus.send(authSucessEvent, {
                        header: { source: 'security', event: authSucessEvent },
                        body: {
                            ban,
                            ctn,
                            route: routeOnSuccess,
                            message: isAuthBypass
                                ? 'Customer Authenticated via bypass'
                                : 'Customer Authenticated successfully',
                            // Add the auth token here from eventData
                            authToken: authToken,
                        },
                    });
                }
                logCustAuthDetails(authInfo, custAuthLogInfo, isSuccess);
            }
            setIsLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

const SecurityQuestion = ({
    data,
    workflows,
    onCancel,
    onAuthRouteTo,
    datasources,
    bypassOptionsMetadata,
    profiles,
    landingBoard,
    authSuccessEvent,
    authDeniedEvent,
    ban,
    ctn,
    backButtonString,
    enableBackButton,
    handleBackClick,
}) => {
    const { question, questionCode, billingAccountNumber, bypassOnly } = data;
    const { otp, validateCustomer, logCustAuth, getAuthToken } = workflows;
    const [form] = Form.useForm();
    const [radioVal, setRadioVal] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const history = useHistory();
    const [otpStatus, setOTPStatus] = useState(undefined);

    let { mechId, attId } = window[sessionStorage?.tabId].COM_IVOYANT_VARS;

    let restrictedBypassOptions = profiles?.categories
        ?.find(
            (c) =>
                c.name ===
                window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile
        )
        ?.categories?.find(
            (c) => c.name === 'restrictBypassOptions'
        )?.bypassOptions;

    let bypassOptions = [];

    if (restrictedBypassOptions && restrictedBypassOptions?.length) {
        bypassOptions = bypassOptionsMetadata?.filter((option) =>
            restrictedBypassOptions?.find((name) => name === option.name)
        );
    } else {
        bypassOptions = bypassOptionsMetadata;
    }

    // To order the options based on rank
    bypassOptions?.sort(function (a, b) {
        return parseInt(a?.rank, 10) - parseInt(b?.rank, 10);
    });

    const isFormValid = () => {
        const { receivedPin, securityAnswer, bypassAnswer, receivedOTP } =
            form.getFieldsValue();

        const fieldMapping = {
            pin: receivedPin?.unmasked,
            sqa: securityAnswer?.unmasked,
            bypass: bypassAnswer,
            otp: receivedOTP?.unmasked,
        };
        return (
            form.getFieldsError().filter(({ errors }) => errors.length)
                .length === 0 && fieldMapping[radioVal]
        );
    };

    const requestOTP = () => {
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = otp;
        const submitEvent = 'SUBMIT';

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'INIT',
            },
        });

        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleOTPSent(successStates, errorStates, setOTPStatus),
            {}
        );
        MessageBus.send(
            'WF.'.concat(workflow).concat('.').concat(submitEvent),
            {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: submitEvent,
                },
                body: {
                    datasource: datasources[datasource],
                    request: { params: { phonenumber: data[0]?.ctn } },
                    responseMapping,
                },
            }
        );
    };

    const onFinish = async (values) => {
        const authInfo = {
            authMethod: radioVal,
            bypassAnswer: values?.bypassAnswer,
            customerInfo: data,
        };

        const custAuthLogInfo = {
            datasource: datasources[logCustAuth.datasource],
            workflow: logCustAuth.workflow,
        };

        const conversationId = `${mechId}~${attId}~${billingAccountNumber}~${uuid()}`;

        if (radioVal === 'bypass' && values?.bypassAnswer) {
            const selBypassOption = bypassOptions.find(
                (option) => option.name === values.bypassAnswer
            );
            window[sessionStorage.tabId].conversationId = conversationId;
            if (selBypassOption && selBypassOption?.bypass === 'false') {
                setErrorMsg(selBypassOption.message);
                setIsLoading(false);
                logCustAuthDetails(authInfo, custAuthLogInfo, false);
                MessageBus.send(authDeniedEvent, {
                    header: { source: 'security', event: authDeniedEvent },
                    body: {
                        ban,
                        ctn,
                        route: onAuthRouteTo,
                        message: 'Access Denied for Customer Account',
                    },
                });
            } else {
                if (CHECK_AUTH_TOKEN) {
                    // Get Auth token - CallService on succesfull auth bypass - START
                    MessageBus.send(
                        'WF.'.concat(getAuthToken.workflow).concat('.INIT'),
                        {
                            header: {
                                registrationId: getAuthToken.workflow,
                                workflow: getAuthToken.workflow,
                                eventType: 'INIT',
                            },
                        }
                    );
                    MessageBus.subscribe(
                        getAuthToken.workflow,
                        'WF.'
                            .concat(getAuthToken.workflow)
                            .concat('.STATE.CHANGE'),
                        handleGetAuthTokenResponse(
                            getAuthToken.successStates,
                            getAuthToken.errorStates,
                            onAuthRouteTo,
                            history,
                            authInfo,
                            custAuthLogInfo,
                            setIsLoading,
                            setErrorMsg,
                            authSuccessEvent,
                            authDeniedEvent,
                            ban,
                            ctn,
                            conversationId,
                            true
                        ),
                        {}
                    );
                    MessageBus.send(
                        'WF.'
                            .concat(getAuthToken.workflow)
                            .concat('.')
                            .concat('SUBMIT'),
                        {
                            header: {
                                registrationId: getAuthToken.workflow,
                                workflow: getAuthToken.workflow,
                                eventType: 'SUBMIT',
                            },
                            body: {
                                datasource: {
                                    ...datasources[getAuthToken.datasource],
                                    baseUri: datasources[
                                        getAuthToken.datasource
                                    ].baseUri.replace('{ban}', ban.toString()),
                                    url: datasources[
                                        getAuthToken.datasource
                                    ].url.replace('{ban}', ban.toString()),
                                },
                                request: {},
                                responseMapping: getAuthToken.responseMapping,
                            },
                        }
                    );
                    // Get Auth token - CallService on succesfull auth bypass - END
                }

                if (!CHECK_AUTH_TOKEN) {
                    MessageBus.send(authSuccessEvent, {
                        header: { source: 'security', event: authSuccessEvent },
                        body: {
                            ban,
                            ctn,
                            route: onAuthRouteTo,
                            message: 'Customer Authenticated via bypass',
                        },
                    });
                    setErrorMsg('');
                    logCustAuthDetails(authInfo, custAuthLogInfo, true);
                }
            }
        } else {
            setIsLoading(true);
            setErrorMsg('');

            let requestBody = {};

            if (radioVal === 'pin') {
                requestBody = { pin: values.receivedPin?.unmasked };
            }

            if (radioVal === 'otp') {
                requestBody = { pin: values.receivedOTP?.unmasked };
            }

            if (radioVal === 'sqa') {
                requestBody = {
                    securityAnswer: {
                        questionCode,
                        answer: values.securityAnswer?.unmasked,
                    },
                };
            }
            const {
                workflow,
                datasource,
                successStates,
                errorStates,
                responseMapping,
            } = validateCustomer;
            const submitEvent = 'SUBMIT';

            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                hanldeValidateCustomerResponse(
                    successStates,
                    errorStates,
                    onAuthRouteTo,
                    history,
                    authInfo,
                    custAuthLogInfo,
                    setIsLoading,
                    setErrorMsg,
                    authSuccessEvent,
                    authDeniedEvent,
                    ban,
                    ctn,
                    conversationId
                ),
                {}
            );
            MessageBus.send(
                'WF.'.concat(workflow).concat('.').concat(submitEvent),
                {
                    header: {
                        registrationId: workflow,
                        workflow,
                        eventType: submitEvent,
                    },
                    body: {
                        datasource: datasources[datasource],
                        request: {
                            params: { targetAccount: billingAccountNumber },
                            body: requestBody,
                        },
                        responseMapping,
                    },
                }
            );
        }
    };

    const onRadioChange = (e) => {
        setRadioVal(e.target.value);
        setErrorMsg('');
        form.resetFields(['receivedPin', 'securityAnswer', 'bypassAnswer']);
    };

    const columns = [
        {
            title: renderTitle('User Name'),
            dataIndex: 'userName',
        },
        {
            title: renderTitle('Account Name'),
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
            title: renderTitle('imsi'),
            dataIndex: 'imsi',
        },
    ];

    const isValidPIN = (_, value) => {
        if (value?.unmasked && value?.unmasked.length < 4) {
            return Promise.reject(`PIN should be 4 digits`);
        }
        return Promise.resolve();
    };

    const isValidOTP = (_, value) => {
        if (value?.unmasked && value?.unmasked.length < 4) {
            return Promise.reject(`OTP should be 4 digits`);
        }
        return Promise.resolve();
    };

    const isValidSecurityAnswer = (_, value) => {
        if (value?.unmasked && value?.unmasked.length < 4) {
            return Promise.reject(
                `Security answer should have atleast 4 characters`
            );
        }
        return Promise.resolve();
    };

    return (
        <>
            <Row>
                {errorMsg !== '' && (
                    <Row>
                        <Col>
                            <Space>
                                <Alert message={errorMsg} type="error" />
                            </Space>
                        </Col>
                    </Row>
                )}
            </Row>
            <Row className="mb">
                <Col span={24}>
                    {enableBackButton && (
                        <Row span={24}>
                            <Col
                                className="back-button"
                                onClick={() => handleBackClick()}
                            >
                                <ArrowLeftOutlined
                                    style={{
                                        margin: 'auto 0',
                                        paddingRight: '10px',
                                    }}
                                />
                                {backButtonString}
                            </Col>
                        </Row>
                    )}
                    <Row span={24} style={{ paddingTop: '20px' }}>
                        <Col>
                            <Text strong>
                                {'PLEASE CHOOSE AUTHENTICATION METHOD'}
                            </Text>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="mb">
                <Col span={24}>
                    <Table
                        className="caller-search-table"
                        columns={columns}
                        dataSource={data}
                        size="middle"
                        pagination={false}
                    />
                </Col>
            </Row>

            <Form form={form} onFinish={onFinish}>
                <Radio.Group
                    style={{ width: '100%' }}
                    className="mb"
                    onChange={onRadioChange}
                    value={radioVal}
                >
                    <Row gutter={24}>
                        {!bypassOnly && (
                            <>
                                <Col xs={24} lg={18} xl={12} xxl={8}>
                                    <Radio
                                        value="sqa"
                                        disabled={
                                            data[0]?.banStatus === 'T' ||
                                            question === undefined
                                        }
                                    >
                                        Authenticate With Security Question and
                                        Answer
                                    </Radio>
                                    <OptionBox
                                        description="Security Question"
                                        text={question}
                                    >
                                        <Form.Item
                                            {...layout}
                                            name="securityAnswer"
                                            rules={[
                                                {
                                                    validator:
                                                        isValidSecurityAnswer,
                                                },
                                            ]}
                                        >
                                            <MaskedInput
                                                placeholder="Enter your security answer"
                                                disabled={radioVal !== 'sqa'}
                                                autoComplete="off"
                                            />
                                        </Form.Item>
                                    </OptionBox>
                                </Col>
                                <Col xs={24} lg={18} xl={12} xxl={8}>
                                    <Radio value="pin">
                                        Authenticate with PIN
                                    </Radio>
                                    <OptionBox description="Please confirm security PIN code from the customer and enter recieved PIN code to authenticate.">
                                        <Form.Item
                                            {...layout}
                                            name="receivedPin"
                                            rules={[
                                                {
                                                    validator: isValidPIN,
                                                },
                                            ]}
                                        >
                                            <MaskedInput
                                                placeholder="Enter PIN code"
                                                disabled={radioVal !== 'pin'}
                                                autoComplete="off"
                                                maxLength={4}
                                                isNumber={true}
                                            />
                                        </Form.Item>
                                    </OptionBox>
                                </Col>
                                <Col xs={24} lg={18} xl={12} xxl={8}>
                                    <Radio
                                        value="otp"
                                        disabled={data[0]?.banStatus === 'T'}
                                    >
                                        Authenticate with OTP
                                    </Radio>
                                    <OptionBox description="Please click on Send OTP to send OTP to Customer. Once Customer provides OTP enter it to authenticate">
                                        <Row justify="start">
                                            <Col span={16}>
                                                <Form.Item
                                                    {...layout}
                                                    name="receivedOTP"
                                                    wrapperCol={{ sm: 20 }}
                                                    rules={[
                                                        {
                                                            validator:
                                                                isValidOTP,
                                                        },
                                                    ]}
                                                >
                                                    <MaskedInput
                                                        placeholder="Enter One Time Passcode"
                                                        disabled={
                                                            radioVal !==
                                                                'otp' ||
                                                            (radioVal ===
                                                                'otp' &&
                                                                otpStatus !==
                                                                    'sent')
                                                        }
                                                        autoComplete="off"
                                                        maxLength={4}
                                                        isNumber={true}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Button
                                                    type={
                                                        radioVal !== 'otp'
                                                            ? 'default'
                                                            : 'primary'
                                                    }
                                                    onClick={() => requestOTP()}
                                                    disabled={
                                                        radioVal !== 'otp'
                                                    }
                                                >
                                                    Send OTP
                                                </Button>
                                            </Col>
                                        </Row>
                                    </OptionBox>
                                </Col>
                            </>
                        )}
                        <Col xs={24} lg={18} xl={12} xxl={24}>
                            <Radio value="bypass">Bypass Authentication</Radio>
                            <Form.Item {...layout} name="bypassAnswer">
                                <Select
                                    style={{ marginTop: 20, maxWidth: 320 }}
                                    placeholder="Please select a reason"
                                    disabled={radioVal !== 'bypass'}
                                >
                                    {bypassOptions.map((o) => (
                                        <Option key={o.name} value={o.name}>
                                            {o.option}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Radio.Group>
                <Row>
                    <Col>
                        <Space>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Form.Item style={{ marginBottom: 0 }} shouldUpdate>
                                {() => (
                                    <Button
                                        type={
                                            isFormValid()
                                                ? 'primary'
                                                : 'default'
                                        }
                                        htmlType="submit"
                                        loading={isLoading}
                                        disabled={!isFormValid()}
                                    >
                                        {radioVal && radioVal === 'bypass'
                                            ? 'Continue'
                                            : 'Authenticate'}
                                    </Button>
                                )}
                            </Form.Item>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default SecurityQuestion;
