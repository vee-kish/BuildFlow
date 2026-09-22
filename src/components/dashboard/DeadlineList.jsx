import { getProjectById } from "../../data/mockData";
import { daysUntil, formatDate } from "../../utils/format";
import { cx } from "../../utils/cx";

export function DeadlineList({ deadlines }) {
  if (deadlines.length === 0) {
    return <p className="dash-empty">No upcoming deadlines.</p>;
  }

  return (
    <ul className="deadline-list">
      {deadlines.map((deadline) => {
        const project = getProjectById(deadline.projectId);
        const days = daysUntil(deadline.date);
        return (
          <li key={deadline.id} className="deadline-list__item">
            <span
              className={cx(
                "deadline-list__days",
                days <= 3 && "deadline-list__days--soon",
                days < 0 && "deadline-list__days--overdue"
              )}
              aria-label={days < 0 ? `${Math.abs(days)} days overdue` : `in ${days} days`}
            >
              {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
            </span>
            <div className="deadline-list__body">
              <p className="deadline-list__title">{deadline.title}</p>
              <p className="deadline-list__meta">
                {project?.name} · {formatDate(deadline.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
