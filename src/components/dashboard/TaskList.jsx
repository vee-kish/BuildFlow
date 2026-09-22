import { StatusBadge } from "../common/StatusBadge";
import { getProjectById } from "../../data/mockData";
import { formatDate } from "../../utils/format";

export function TaskList({ tasks, emptyMessage = "No tasks assigned." }) {
  if (tasks.length === 0) {
    return <p className="dash-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const project = getProjectById(task.projectId);
        return (
          <li key={task.id} className="task-list__item">
            <div className="task-list__body">
              <p className="task-list__title">{task.title}</p>
              <p className="task-list__meta">
                {project?.name}
                {task.dueDate ? ` · due ${formatDate(task.dueDate)}` : ""}
              </p>
            </div>
            <StatusBadge status={task.overdue ? "overdue" : task.status} />
            <StatusBadge status={task.severity} />
          </li>
        );
      })}
    </ul>
  );
}
