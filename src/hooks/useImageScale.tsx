import { useState } from 'react';

import ALL_CLASSES from '../common/config';

export const useImageScale = () => {
    const [imageScale, setImageScale] = useState(1);

    const handleImageScale = (e: any) => {
        if (typeof e === 'number') {
            console.log(e);
            setImageScale(e);
        } else {
            setImageScale(e.currentTarget.value);
        }
  };

    return [
        {
            imageScale,
        },
        {
            handleImageScale,
        },
    ] as any;
};
