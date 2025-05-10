import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { SHORTCUTS } from '../../utils/keyboardShortcuts';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const shortcutCategories = [
    { title: 'Global Shortcuts', shortcuts: SHORTCUTS.GLOBAL },
    { title: 'Cases', shortcuts: SHORTCUTS.CASES },
    { title: 'Documents', shortcuts: SHORTCUTS.DOCUMENTS },
    { title: 'Billing', shortcuts: SHORTCUTS.BILLING },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <CommandLineIcon className="h-5 w-5 mr-2 text-primary-500" />
                    Keyboard Shortcuts
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-2 space-y-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">?</kbd> at any time to show this dialog.
                  </p>
                  
                  {shortcutCategories.map(category => (
                    <div key={category.title}>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">{category.title}</h4>
                      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.entries(category.shortcuts).map(([id, { key, description }]) => (
                              <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                  {description}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                                  {key.split(' ').map((k, i) => (
                                    <React.Fragment key={k}>
                                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                        {k}
                                      </kbd>
                                      {i < key.split(' ').length - 1 && (
                                        <span className="mx-1 text-xs text-gray-500 dark:text-gray-400">then</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-100 dark:bg-primary-900 px-4 py-2 text-sm font-medium text-primary-900 dark:text-primary-100 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default KeyboardShortcutsModal;
