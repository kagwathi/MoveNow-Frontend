'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message, options = {}) =>
      addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) =>
      addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      addToast({ type: 'info', message, ...options }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [show, setShow] = useState(true);

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
    },
    warning: {
      icon: ExclamationCircleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  const handleClose = () => {
    setShow(false);
    setTimeout(onRemove, 300);
  };

  return (
    <Transition
      show={show}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-300"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
    >
      <div
        className={cn(
          'min-w-sm w-full shadow-lg rounded-lg pointer-events-auto border',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn('h-6 w-6', config.iconColor)} />
            </div>
            <div className="ml-3 w-0 flex-1">
              {toast.title && (
                <p className={cn('text-sm font-medium', config.textColor)}>
                  {toast.title}
                </p>
              )}
              <p className={cn('text-sm', config.textColor)}>{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={cn(
                  'rounded-md inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.iconColor
                )}
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
