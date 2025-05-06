import React from 'react';
import EventTypeBadge from './EventTypeBadge';

const CalendarLegend = () => {
  const eventTypes = ['meeting', 'deadline', 'hearing', 'task', 'reminder', 'other'];
  
  return (
    <div className="flex flex-wrap gap-2 my-3">
      {eventTypes.map(type => (
        <EventTypeBadge key={type} type={type} />
      ))}
    </div>
  );
};

export default CalendarLegend;
