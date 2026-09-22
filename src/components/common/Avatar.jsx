import { getInitials } from "../../utils/format";
import { cx } from "../../utils/cx";
import "./Avatar.css";

export function Avatar({ name, size = "md", className }) {
  return (
    <span
      className={cx("avatar", `avatar--${size}`, className)}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
