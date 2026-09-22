import { AlertTriangle, CalendarClock, FileText, MapPin } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "./Avatar";
import { formatDate } from "../../utils/format";
import { cx } from "../../utils/cx";
import "./ProjectCard.css";

export function ProjectCard({ project, team = [], className, onClick }) {
  const Wrapper = onClick ? "button" : "article";
  const visibleTeam = team.slice(0, 4);
  const extraCount = team.length - visibleTeam.length;

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={cx("project-card", onClick && "project-card--clickable", className)}
      aria-label={onClick ? `Open ${project.name}` : undefined}
    >
      <div className="project-card__top">
        <h3 className="project-card__name">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>

      <p className="project-card__meta">
        <MapPin size={14} aria-hidden="true" />
        {project.location} · {project.client}
      </p>

      <div className="project-card__progress">
        <div className="project-card__progress-head">
          <span>Completion</span>
          <strong>{project.completion}%</strong>
        </div>
        <div
          className="project-card__bar"
          role="progressbar"
          aria-valuenow={project.completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${project.name} completion`}
        >
          <div className="project-card__bar-fill" style={{ width: `${project.completion}%` }} />
        </div>
      </div>

      <div className="project-card__stats">
        <span className="project-card__stat">
          <FileText size={14} aria-hidden="true" />
          {project.documentCount} docs
        </span>
        <span className="project-card__stat">
          <AlertTriangle size={14} aria-hidden="true" />
          {project.openIssues} open issues
        </span>
        {project.overdueItems > 0 && (
          <span className="project-card__stat project-card__stat--danger">
            {project.overdueItems} overdue
          </span>
        )}
      </div>

      <div className="project-card__footer">
        {team.length > 0 ? (
          <div className="project-card__team">
            {visibleTeam.map((member) => (
              <Avatar key={member} name={member} size="sm" className="project-card__avatar" />
            ))}
            {extraCount > 0 && (
              <span className="project-card__more" aria-hidden="true">
                +{extraCount}
              </span>
            )}
            <span className="sr-only">
              Team: {team.join(", ")}
            </span>
          </div>
        ) : (
          <span className="project-card__team project-card__team--empty">No team assigned</span>
        )}
        {project.targetDate && (
          <span className="project-card__due">
            <CalendarClock size={14} aria-hidden="true" />
            Due {formatDate(project.targetDate)}
          </span>
        )}
      </div>
    </Wrapper>
  );
}

