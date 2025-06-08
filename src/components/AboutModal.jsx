import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function AboutModal({ isOpen, onClose }) {
  const currentYear = new Date().getFullYear();

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
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900 dark:text-white mb-4"
                >
                  About Persona Vault
                </Dialog.Title>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-3">
                  <p>
                    Persona Vault is a modern PWA tool for managing and experimenting with your AI Personas and Prompts.
                  </p>
                  <p>
                    This app was entirely built by Michaël Redant, without prior React knowledge — using one of his own crafted AI Personas. 💪✨
                  </p>
                  <p>
                    &copy; {currentYear} Michaël Redant. All rights reserved.
                  </p>
                  <p>
                    Visit my websites:
                    <br />
                    <a
                      href="https://www.xinudesign.be"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Xinudesign.be
                    </a>
                    {' | '}
                    <a
                      href="https://www.x3dprints.be"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      X3DPrints.be
                    </a>
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
