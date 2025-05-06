import React from 'react';
import {
  CalendarIcon,
  BriefcaseIcon,
  ClockIcon,
  DocumentTextIcon,
  BellAlertIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const EventTypeBadge = ({ type }) => {
  // Define properties based on event type
  const typeProperties = {
    meeting: {
      icon: CalendarIcon,
      label: 'Meeting',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-800 dark:text-indigo-200'
    },
    deadline: {
      icon: ClockIcon,
      label: 'Deadline',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-200'
    },
    hearing: {
      icon: BriefcaseIcon,
      label: 'Court Hearing',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-800 dark:text-amber-200'
    },
    task: {
      icon: DocumentTextIcon,
      label: 'Task',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-200'
    },
    reminder: {
      icon: BellAlertIcon,
      label: 'Reminder',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-800 dark:text-purple-200'
    },
    other: {
      icon: QuestionMarkCircleIcon,
      label: 'Other',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200'
    }
  };
  
  // Get properties for this type, or use 'other' as fallback
  const { icon: Icon, label, bgColor, textColor } = typeProperties[type] || typeProperties.other;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="h-3.5 w-3.5 mr-1" />
      {label}
    </span>
  );
};

export default EventTypeBadge;
