import { useMemo } from 'react';
import './DatePicker.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DatePicker({ selected, onChange, days = 7 }) {
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        date: d,
        key: d.toISOString().split('T')[0],
        day: DAYS[d.getDay()],
        dateNum: d.getDate(),
        month: MONTHS[d.getMonth()],
      });
    }
    return result;
  }, [days]);

  return (
    <div className="date-picker" role="listbox" aria-label="Select date">
      {dates.map((item) => (
        <button
          key={item.key}
          className={`date-picker__item ${selected === item.key ? 'date-picker__item--active' : ''}`}
          onClick={() => onChange(item.key)}
          role="option"
          aria-selected={selected === item.key}
        >
          <span className="date-picker__day">{item.day}</span>
          <span className="date-picker__date">{item.dateNum}</span>
          <span className="date-picker__month">{item.month}</span>
        </button>
      ))}
    </div>
  );
}
