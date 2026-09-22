import { Camera } from "lucide-react";
import { getUserById, getProjectById } from "../../data/mockData";
import { formatRelativeTime } from "../../utils/format";

export function SiteUpdates({ updates }) {
  if (updates.length === 0) {
    return <p className="dash-empty">No recent site updates.</p>;
  }

  return (
    <ul className="site-updates">
      {updates.map((update) => {
        const author = getUserById(update.authorId);
        const project = getProjectById(update.projectId);
        return (
          <li key={update.id} className="site-updates__item">
            <div className="site-updates__body">
              <p className="site-updates__title">{update.title}</p>
              <p className="site-updates__meta">
                {project?.name} · {author?.name} ·{" "}
                {formatRelativeTime(update.timestamp)}
              </p>
            </div>
            {update.photoCount > 0 && (
              <span className="site-updates__photos">
                <Camera size={14} aria-hidden="true" />
                {update.photoCount}
                <span className="sr-only">photos attached</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
