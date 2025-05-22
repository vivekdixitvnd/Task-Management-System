import { Link } from "react-router-dom";
import { Clock, Flag, Paperclip } from "react-feather";
import { formatDate } from "../utils/formatters";

const TaskCard = ({ task }) => {
  // Status class mapping
  const statusClasses = {
    pending: "status-pending",
    "in-progress": "status-in-progress",
    completed: "status-completed",
  };

  // Priority class mapping
  const priorityClasses = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };

  // Format status for display
  const formatStatus = (status) => {
    if (typeof status !== "string") return "Unknown Status";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Link to={`/tasks/${task?._id ?? "#"}`} className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task?.title ?? "Untitled Task"}</h3>
        <span className={`task-status ${statusClasses[task?.status] || ""}`}>
          {formatStatus(task?.status)}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">
        {task?.description ?? "No description provided."}
      </p>

      <div className="task-meta">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          <span>{formatDate(task?.dueDate)}</span>
        </div>

        <div className={`task-priority ${priorityClasses[task?.priority] || ""}`}>
          <Flag size={14} />
          <span>
            {typeof task?.priority === "string"
              ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
              : "Not Set"}
          </span>
        </div>

        {Array.isArray(task?.documents) && task.documents.length > 0 && (
          <div className="flex items-center gap-1">
            <Paperclip size={14} />
            <span>{task.documents.length}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-sm">
        <span className="text-gray-600">Assigned to: </span>
        <span className="font-medium">
          {task?.assignedTo?.name ?? "Unassigned"}
        </span>
      </div>
    </Link>
  );
};

export default TaskCard;
