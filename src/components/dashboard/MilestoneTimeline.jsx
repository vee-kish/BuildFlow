import { CheckCircle2, Circle, Loader } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../utils/format";
import { cx } from "../../utils/cx";

const STATUS_ICONS = {
  done: CheckCircle2,
  "in-progress": Loader,
  upcoming: Circle,
};

export function MilestoneTimeline({ milestones }) {
  if (!milestones || milestones.length === 0) {
    return <p className="dash-empty">No milestones recorded yet.</p>;
  }

  return (
    <ol className="milestone-timeline">
      {milestones.map((milestone) => {
        const Icon = STATUS_ICONS[milestone.status] ?? Circle;
        return (
          <li
            key={milestone.id}
            className={cx("milestone-timeline__item", `milestone-timeline__item--${milestone.status}`)}
          >
            <Icon
              size={18}
              className="milestone-timeline__icon"
              aria-hidden="true"
            />
            <div className="milestone-timeline__body">
              <p className="milestone-timeline__title">{milestone.title}</p>
              <p className="milestone-timeline__date">{formatDate(milestone.date)}</p>
            </div>
            <StatusBadge status={milestone.status} />
          </li>
        );
      })}
    </ol>
  );
}
