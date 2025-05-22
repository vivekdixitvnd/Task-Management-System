"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { getTaskById, updateTask, deleteTask, downloadDocument } from "../redux/slices/taskSlice"
import Modal from "../components/Modal"
import TaskForm from "../components/TaskForm"
import Alert from "../components/Alert"
import { Edit, Trash2, ArrowLeft, FileText, Download, Eye } from "react-feather"
import { formatDate } from "../utils/formatters"
import api from "../utils/api"

const TaskDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { task, loading, error } = useSelector((state) => state.tasks)
  const { user } = useSelector((state) => state.auth)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [alert, setAlert] = useState(null)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  useEffect(() => {
    dispatch(getTaskById(id))
  }, [dispatch, id])

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }

  const priorityClasses = {
    high: "text-red-600",
    medium: "text-orange-600",
    low: "text-green-600",
  }

  const formatStatus = (status) => {
    if (!status || typeof status !== "string") return "Unknown"
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleEditTask = (taskData) => {
    dispatch(updateTask({ id, taskData }))
      .unwrap()
      .then(() => {
        setIsEditModalOpen(false)
        setAlert({ type: "success", message: "Task updated successfully" })
      })
      .catch(() => {})
  }

  const handleDeleteTask = () => {
    dispatch(deleteTask(id))
      .unwrap()
      .then(() => navigate("/dashboard"))
      .catch(() => setIsDeleteModalOpen(false))
  }

  const handleDownloadDocument = (documentId, documentName) => {
    try {
      console.log("Downloading document:", documentId, documentName);
      setAlert({ type: "info", message: "Downloading document..." });
      dispatch(downloadDocument({ taskId: id, documentId, documentName }))
        .unwrap()
        .then(() => {
          setAlert({ type: "success", message: "Document downloaded successfully" });
        })
        .catch((error) => {
          console.error("Download error:", error);
          setAlert({ type: "danger", message: `Failed to download: ${error}` });
        });
    } catch (error) {
      console.error("Download exception:", error);
      setAlert({ type: "danger", message: "An unexpected error occurred" });
    }
  }

  const handleViewDocument = async (documentId, documentName) => {
    try {
      // First request a temporary token for the document
      console.log("Requesting preview token for document:", documentId);
      setAlert({ type: "info", message: "Preparing document preview..." });
      
      const response = await api.get(`/tasks/${id}/create-preview-token/${documentId}`);
      
      if (response.data && response.data.success && response.data.previewUrl) {
        // Get API base URL without the /api suffix to avoid double /api/api
        const apiBaseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api$/, '') : '';
        const fullPreviewUrl = `${apiBaseUrl}/api${response.data.previewUrl}`;
        
        console.log("Viewing document with public URL:", fullPreviewUrl);
        
        setViewingDocument({
          id: documentId,
          name: documentName,
          url: fullPreviewUrl
        });
        setIsPdfModalOpen(true);
        setAlert(null);
      } else {
        console.error("Failed to get preview URL:", response.data);
        setAlert({ type: "danger", message: "Failed to prepare document preview" });
      }
    } catch (error) {
      console.error("Error preparing document preview:", error);
      setAlert({ 
        type: "danger", 
        message: error.response?.data?.message || "Failed to prepare document preview" 
      });
    }
  };

  const canModifyTask = () => {
    if (!task || !user) return false
    if (user.role === "admin") return true
    return task.assignedTo?._id === user._id || task.createdBy === user._id
  }

  if (loading) {
    return <div className="text-center py-8">Loading task details...</div>
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert type="danger" message={error} />
        <button className="btn btn-primary mt-4 flex items-center gap-2" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="py-8">
        <Alert type="danger" message="Task not found" />
        <button className="btn btn-primary mt-4 flex items-center gap-2" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="task-detail-header">
        <button className="btn btn-secondary flex items-center gap-2" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Back
        </button>

        {canModifyTask() && (
          <div className="task-detail-actions">
            <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}>
              <Edit size={18} />
              Edit
            </button>
            <button className="btn btn-danger flex items-center gap-2" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <h1 className="task-detail-title">{task.title}</h1>

        <div className="task-detail-meta mt-4">
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className={`inline-block px-2 py-1 rounded text-sm ${statusClasses[task.status] || ""}`}>
              {formatStatus(task.status)}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Priority</span>
            <span className={`meta-value ${priorityClasses[task.priority] || ""}`}>
              {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "N/A"}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Due Date</span>
            <span className="meta-value">{formatDate(task.dueDate)}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Assigned To</span>
            <span className="meta-value">{task.assignedTo?.name || "Unassigned"}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Created By</span>
            <span className="meta-value">{task.createdBy?.name || "Unknown"}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Created At</span>
            <span className="meta-value">{formatDate(task.createdAt)}</span>
          </div>
        </div>

        <div className="task-description mt-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-line">{task.description}</p>
        </div>

        {task.documents && task.documents.length > 0 && (
          <div className="task-attachments mt-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText size={18} />
              <span>Attachments</span>
            </h2>
            <div className="attachment-list">
              {task.documents.map((doc) => (
                <div key={doc._id} className="attachment-item">
                  <div className="attachment-info">
                    <span>{doc.originalName}</span>
                  </div>
                  <div className="attachment-actions">
                    <button 
                      className="btn btn-sm btn-secondary flex items-center gap-1"
                      onClick={() => handleViewDocument(doc._id, doc.originalName)}
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-1"
                      onClick={() => handleDownloadDocument(doc._id, doc.originalName)}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
        <TaskForm task={task} onSubmit={handleEditTask} buttonText="Update Task" />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Task">
        <div>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteTask}>
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isPdfModalOpen} 
        onClose={() => {
          setIsPdfModalOpen(false);
          setViewingDocument(null);
        }} 
        title={viewingDocument?.name || "View Document"}
        fullWidth={true}
      >
        <div className="pdf-viewer">
          {viewingDocument && (
            <>
              <div className="pdf-toolbar mb-4">
                <a 
                  href={viewingDocument.url} 
                  download={viewingDocument.name}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
              <div className="pdf-container">
                <iframe 
                  src={viewingDocument.url} 
                  title={viewingDocument.name}
                  width="100%"
                  height="600px"
                  style={{ border: "none" }}
                ></iframe>
              </div>
            </>
          )}
          {!viewingDocument && (
            <div className="text-center p-8">Unable to load document.</div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default TaskDetails
