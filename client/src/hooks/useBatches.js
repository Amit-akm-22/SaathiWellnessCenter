import { useState } from 'react';

export const useBatches = () => {
  const [batches] = useState([
    '2021-2025',
    '2022-2026',
    '2023-2027',
    '2024-2028',
    '2025-2029',
    '2026-2030',
    '2020-2024',
    '2019-2023',
    '2018-2022',
  ]);

  return { batches };
};

export default useBatches;
