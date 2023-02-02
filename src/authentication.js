import React, { useState, useEffect, useRef } from 'react';
import { Alert, Col, Row } from 'antd';
import SearchList from './SearchList';
import ContactSearchList from './ContactSearchList';
import { MessageBus } from '@ivoyant/component-message-bus';
import SecurityQuestion from './SecurityQuestion';
import { cache } from '@ivoyant/component-cache';
import { useLocation } from 'react-router-dom';
const INTERACTION_INIT_EVENT = 'SESSION.INTERACTION.INIT';

import './styles.css';

const getNames = (name, lastName) => {
    return `${name} ${lastName}`;
};

const processSearchResults = (
    searchResults,
    subscriberStatuses,
    searchType = 'Account'
) => {
    let results = [];
    if (searchResults) {
        if (searchType === 'Contact') {
            results = JSON.parse(searchResults).map((customer, index) => {
                const {
                    contactCTN,
                    emailAddress,
                    firstName,
                    lastName,
                    createdTime,
                } = customer;
                return {
                    key: index,
                    firstName,
                    lastName,
                    ctn: contactCTN,
                    email: emailAddress,
                    createdTime,
                };
            });
        } else {
            results = JSON.parse(searchResults).map((customer, index) => {
                const {
                    ctn,
                    emailAddress,
                    device,
                    name,
                    subscriberStatus,
                    accountName,
                    statusDate,
                    statusDescription,
                    billingAccountNumber,
                    accountType,
                    accountSubType,
                    banStatus,
                    archived,
                } = customer;
                return {
                    key: index,
                    ctn,
                    device: device?.model,
                    sim: device?.iccid,
                    imei: device?.imei,
                    imsi: device?.imsi,
                    email: emailAddress,
                    subscriberStatus: subscriberStatuses[subscriberStatus],
                    statusDate,
                    statusDescription,
                    billingAccountNumber,
                    banStatus,
                    firstName: name?.firstName,
                    lastName: name?.lastName,
                    userName: getNames(name?.firstName, name?.lastName),
                    accountName: getNames(
                        accountName?.firstName,
                        accountName?.lastName
                    ),
                    accountType,
                    accountSubType,
                    archived,
                };
            });
        }
    }
    // global.console.log('processSearchResults fired');
    return results;
};

const AuthenticationComponent = ({
    properties,
    authenticated,
    datasources,
    landingBoard,
    data,
}) => {
    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }
    const location = useLocation();
    const {
        profiles = {},
        accountSubTypes = {},
        bypassOptionsMetadata,
    } = data?.data;
    const {
        onAuthRouteTo,
        subscriberStatuses,
        accountTypeRestrictions,
        workflows = {},
        authSuccessEvent,
        authDeniedEvent,
    } = properties;
    const [searchResults, setSearchResults] = useState([]);
    const [enableBackButton, setEnableBackButton] = useState(false);
    const { backButtonString = 'Back' } = properties;
    const [searchType, setSearchType] = useState('');
    const [selectedRow, setSelectedRow] = useState();
    const [searchError, setSearchError] = useState('');
    const [authError, setAuthError] = useState('');
    const [searchParameter, setSearchParameter] = useState('');
    const [ctn, setCtn] = useState();
    const [ban, setBan] = useState();
    let { asapId } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
    const prevResult = usePrevious({ searchResults });

    const handleSecurityQuestionResponse =
        (successStates, errorStates, value, ban) =>
        (subscriptionId, topic, eventData, closure) => {
            const state = eventData.value;
            const selection = value;
            const isSuccess = successStates.includes(state);
            const isFailure = errorStates.includes(state);

            if (isSuccess || isFailure) {
                if (isSuccess) {
                    const reponse = eventData?.event.data.data;
                    selection.question = reponse?.question;
                    selection.questionCode = reponse?.questionCode;
                    selection.billingAccountNumber = ban;
                    setAuthError('');
                    setSelectedRow(selection);
                }
                if (isFailure) {
                    selection.billingAccountNumber = ban;
                    setSelectedRow(selection);
                    setAuthError('');
                }
                MessageBus.unsubscribe(subscriptionId);
            }
        };

    const handleAuthClick = async (value, ban, ctn) => {
        setEnableBackButton(true);
        const selection = value;
        setBan(ban);
        setCtn(ctn);
        if (selection?.length > 0 && selection[0].banStatus === 'T') {
            selection.billingAccountNumber = ban;
            setSelectedRow(selection);
        } else {
            const { workflow, datasource, successStates, errorStates } =
                workflows?.securityQuestion;
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
                handleSecurityQuestionResponse(
                    successStates,
                    errorStates,
                    value,
                    ban,
                    ctn
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
                            params: { targetAccount: ban },
                        },
                    },
                }
            );
        }
    };

    const handleSearchContactClick = async (value, ctn) => {
        const selection = value;
        setSelectedRow(selection);
        setCtn(ctn);
        cache.put('contact', true);
        MessageBus.send(INTERACTION_INIT_EVENT, {
            header: { source: 'Voice', event: INTERACTION_INIT_EVENT },
            body: {
                ctn,
                interactionSource: 'Voice',
            },
        });
    };

    const resetAuthClicked = () => {
        setSelectedRow();
    };

    const showDynamic = searchResults.length > 0;

    const refactorStatus = (status) => {
        console.log(status);
        switch (status) {
            case 'A':
                return 'ACTIVE';
            case 'S':
                return 'SUSPENDED';
            case 'C':
                return 'CANCELED';

            default:
                return null;
        }
    };

    useEffect(() => {
        if (location?.state?.routeData?.searchData) {
            setSearchResults([]);
            setSelectedRow(false);
            setAuthError('');

            setSearchType(location?.state?.routeData?.searchType);
            setSearchResults(
                processSearchResults(
                    location?.state?.routeData?.searchData,
                    subscriberStatuses,
                    location?.state?.routeData?.searchType
                )
            );
            window[window.sessionStorage?.tabId].NEW_BAN = null;
            window[window.sessionStorage?.tabId].NEW_CTN = null;
            window[sessionStorage.tabId].conversationId =
                window[sessionStorage.tabId]?.sessionConversationId;
            window[window.sessionStorage?.tabId].authenticated = false;
            if (window[window.sessionStorage?.tabId].unauthenticate) {
                window[window.sessionStorage?.tabId].unauthenticate();
            }
        } else if (location?.state?.routeData?.custAuth) {
            const params = location?.state?.routeData?.custAuth;
            sessionStorage.removeItem('custAuth');
            const newValue = {
                key: 0,
                billingAccountNumber: params?.ban,
                ...params,
            };
            const selection = [];
            selection.bypassOnly = true;
            selection.question = '';
            selection.questionCode = '';
            selection.billingAccountNumber = params?.ban;
            selection.push(newValue);
            setSelectedRow(selection);
            setSearchType(location?.state?.routeData?.searchType);
            setSearchResults([{ ...newValue }]);
            document.title = 'Account - Voyage';
            setBan(params?.ban);
            setCtn(params?.ctn);
        } else if (location?.state?.routeData?.imeiData) {
            const imeiParams = location?.state?.routeData?.imeiData;

            const refactoredStatus = refactorStatus(
                imeiParams?.subscriberStatus
            );

            sessionStorage.removeItem('imeiData');
            const newValue = {
                key: 0,
                firstName: imeiParams?.name?.firstName,
                lastName: imeiParams?.name?.lastName,
                userName: getNames(
                    imeiParams?.name?.firstName,
                    imeiParams?.name?.lastName
                ),
                accountName: getNames(
                    imeiParams?.accountName?.firstName,
                    imeiParams?.accountName?.lastName
                ),
                imsi: imeiParams?.device?.imsi,
                billingAccountNumber: imeiParams?.billingAccountNumber,
                ctn: imeiParams?.ctn,
                email: imeiParams?.emailAddress,
                device: imeiParams?.device?.model,
                subscriberStatus: refactoredStatus,
                sim: imeiParams?.device?.iccid,
                imei: imeiParams?.device?.imei,
                accountSubType: imeiParams?.accountSubType,
                accountType: imeiParams?.accountType,
                archived: imeiParams?.archived,
                banStatus: imeiParams?.banStatus,
            };
            const selection = [];
            selection.question = '';
            selection.questionCode = '';
            selection.billingAccountNumber = imeiParams?.billingAccountNumber;
            selection.push(newValue);
            setSearchResults(selection);
            setSearchType(location?.state?.routeData?.searchType);
            setSearchResults([{ ...newValue }]);
            setBan(imeiParams?.billingAccountNumber);
            setCtn(imeiParams?.ctn);
        }
    }, [location?.key]);

    const handleBackClick = () => {
        resetAuthClicked();
        setEnableBackButton(false);
    };

    return (
        <div>
            {!authenticated && (
                <div className="caller-container">
                    {showDynamic && (
                        <div className="caller-container__dynamic">
                            {searchType == 'Contact' &&
                                (!selectedRow ? (
                                    <>
                                        <ContactSearchList
                                            data={searchResults}
                                            profiles={profiles}
                                            accountSubTypes={accountSubTypes}
                                            onClick={handleSearchContactClick}
                                            searchParameter={searchParameter}
                                        />
                                    </>
                                ) : (
                                    <div>
                                        Creating Interaction... Please wait
                                    </div>
                                ))}
                            {searchType == 'Account' &&
                                (!selectedRow ? (
                                    <SearchList
                                        data={searchResults}
                                        profiles={profiles}
                                        accountSubTypes={accountSubTypes}
                                        onClick={handleAuthClick}
                                        searchParameter={searchParameter}
                                        datasources={datasources}
                                    />
                                ) : (
                                    <SecurityQuestion
                                        data={selectedRow}
                                        workflows={workflows}
                                        onCancel={resetAuthClicked}
                                        onAuthRouteTo={onAuthRouteTo}
                                        bypassOptionsMetadata={
                                            bypassOptionsMetadata
                                        }
                                        datasources={datasources}
                                        landingBoard={landingBoard}
                                        authSuccessEvent={authSuccessEvent}
                                        authDeniedEvent={authDeniedEvent}
                                        profiles={profiles}
                                        ban={ban}
                                        ctn={ctn}
                                        enableBackButton={enableBackButton}
                                        backButtonString={backButtonString}
                                        handleBackClick={handleBackClick}
                                    />
                                ))}
                            {authError !== '' && (
                                <Alert message={authError} type="error" />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuthenticationComponent;
