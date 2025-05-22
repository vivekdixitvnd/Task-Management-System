// Format date to readable format
export const formatDate = (dateString) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date"

  // Format options
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date"

  // Format options
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  return date.toLocaleDateString("en-US", options)
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
