import React, { useState } from 'react';
import { Input } from 'antd';

const formatMaskedInput = (value = {}) => {
    const { newValue, isNumber = false } = value;
    let inputVal = newValue;

    if (isNumber) {
        inputVal = inputVal.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    }

    let unmasked =
        value?.unmasked && inputVal.length > 0 ? value.unmasked : inputVal;
    let masked = '';

    if (inputVal.length > unmasked.length) {
        unmasked = unmasked + inputVal.substring(unmasked.length);
    } else if (inputVal.length < unmasked.length) {
        unmasked = unmasked.substring(0, inputVal.length);
    }

    unmasked.split('').forEach((c, i) => (masked = masked + '\u2022'));

    return {
        unmasked,
        masked,
    };
};

const MaskedInput = ({
    value = {},
    onChange,
    allowClear = true,
    isNumber = false,
    ...restProps
}) => {
    const [displayMasked, setDisplayMasked] = useState(false);

    const onValueChange = (e) => {
        if (e.target.value === '') {
            setDisplayMasked(false);
        }

        onChange(
            formatMaskedInput({
                ...value,
                newValue: e.target.value?.replace(/\s/g, ''),
                isNumber,
            })
        );
    };

    return (
        <Input
            className="fs-exclude"
            {...restProps}
            value={displayMasked ? value?.masked : value?.unmasked}
            onBlur={() => {
                setDisplayMasked(true);
            }}
            onChange={(e) => onValueChange(e)}
            allowClear={allowClear}
        />
    );
};

export default MaskedInput;
