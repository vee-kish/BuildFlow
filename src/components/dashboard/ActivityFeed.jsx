import { Avatar } from "../common/Avatar";
import { getUserById, getProjectById } from "../../data/mockData";
import { formatRelativeTime } from "../../utils/format";

export function ActivityFeed({ activities, emptyMessage = "No recent activity." }) {
  if (activities.length === 0) {
    return <p className="dash-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="activity-feed">
      {activities.map((item) => {
        const user = getUserById(item.userId);
        const project = getProjectById(item.projectId);
        return (
          <li key={item.id} className="activity-feed__item">
            <Avatar name={user?.name ?? "?"} size="sm" />
            <div className="activity-feed__body">
              <p className="activity-feed__text">
                <strong>{user?.name ?? "Unknown"}</strong> {item.action}{" "}
                <strong>{item.target}</strong>
              </p>
              <p className="activity-feed__meta">
                {project?.name} · {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
