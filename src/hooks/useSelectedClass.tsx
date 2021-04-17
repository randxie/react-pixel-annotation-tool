import { useState } from 'react';

import ALL_CLASSES from '../common/config';

export const useSelectedClass = () => {
    // Selected classes to draw mask
    const [selectedClass, setSelectedClass] = useState(ALL_CLASSES[0]);

    const handleSelectedClass = (e: any) => {
        setSelectedClass(e);
    };

    return [
        {
            selectedClass,
        },
        {
            handleSelectedClass,
        },
    ] as any;
};
