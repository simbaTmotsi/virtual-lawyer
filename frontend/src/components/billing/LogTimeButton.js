import React, { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import TimeEntryModal from './TimeEntryModal';

const LogTimeButton = ({ 
  initialData = {}, 
  buttonText = "Log Time",
  buttonClassName = "",
  iconClassName = "h-5 w-5 mr-2",
  buttonSize = "regular", // "small", "regular", "large"
  refreshCallback = null
}) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // After successful submission, close modal and refresh parent if needed
  const onSuccess = () => {
    closeModal();
    if (refreshCallback) refreshCallback();
  };

  // Determine button styling based on size
  let sizeClasses = "px-4 py-2 text-sm";
  if (buttonSize === "small") sizeClasses = "px-3 py-1 text-xs";
  if (buttonSize === "large") sizeClasses = "px-5 py-2.5 text-base";

  // Default button styling
  const defaultClassName = `inline-flex items-center ${sizeClasses} border border-transparent font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={buttonClassName || defaultClassName}
      >
        <ClockIcon className={iconClassName} />
        {buttonText}
      </button>

      {showModal && (
        <TimeEntryModal
          isOpen={showModal}
          onClose={closeModal}
          onSuccess={onSuccess}
          initialData={initialData}
        />
      )}
    </>
  );
};

export default LogTimeButton;
