const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const label = (ym: string) => {
  if (ym === 'present') return 'Present';
  const [year, month] = ym.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
};

/** "2022-12", "2023-02" -> "Dec 2022 — Feb 2023". A single month is shown once. */
export const formatPeriod = (start: string, end: string) =>
  start === end ? label(start) : `${label(start)} — ${label(end)}`;
