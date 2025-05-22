"use client"

import { useState, useEffect } from "react"
import { X } from "react-feather"

const Alert = ({ type = "success", message, onClose, autoClose = true, duration = 5000 }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose, visible])

  if (!visible) return null

  return (
    <div className={`alert alert-${type} flex justify-between items-center`}>
      <div>{message}</div>
      <button
        onClick={() => {
          setVisible(false)
          if (onClose) onClose()
        }}
        className="text-gray-500 hover:text-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Alert
