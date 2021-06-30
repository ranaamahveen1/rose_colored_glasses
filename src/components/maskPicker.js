import React, { useState } from 'react';

export const MaskPicker = (props) => {
    const { masks, onMaskChanged, ...other } = props;
    const [active, setActive] = useState();

    const changeMask = (e) => {
        const index = Number(e.target.value);
        setActive(index);
        const maskUrl = masks[index];
        if (onMaskChanged) onMaskChanged(maskUrl);
    }

    return (
        <div {...other}>
            { masks.map((mask, index) => {
                return (<input key={mask} type="radio" name="mask" onChange={ changeMask } value={index} checked={active===index}/>)
            }) }
        </div>
    );
};

export default MaskPicker;
