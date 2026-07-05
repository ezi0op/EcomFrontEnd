import React from 'react'

const ToastNotification = ({ toast }) => {
  if (!toast) return null

  return (
    <div
      className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl font-semibold text-white flex items-center gap-3 animate-slide-in z-40 ${
        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      <span>{toast.message}</span>
    </div>
  )
}

export default ToastNotification
