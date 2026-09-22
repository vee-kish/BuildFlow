import { Camera, FileUp, FolderPlus, UserPlus, AlertOctagon } from "lucide-react";
import { Button } from "../common/Button";
import { useToast } from "../../context/ToastContext";

const comingSoon = (show, title) =>
  show({
    type: "info",
    title,
    message: "This action arrives in a later phase.",
  });

export function QuickActions({ actions = [] }) {
  const { show } = useToast();

  const registry = {
    "new-project": {
      label: "New Project",
      icon: FolderPlus,
      onClick: () => comingSoon(show, "New Project"),
    },
    "upload-document": {
      label: "Upload Document",
      icon: FileUp,
      onClick: () => comingSoon(show, "Upload Document"),
    },
    "create-issue": {
      label: "Create Issue",
      icon: AlertOctagon,
      onClick: () => comingSoon(show, "Create Issue"),
    },
    "invite-member": {
      label: "Invite Team Member",
      icon: UserPlus,
      onClick: () => comingSoon(show, "Invite Team Member"),
    },
    "add-photos": {
      label: "Add Site Photos",
      icon: Camera,
      onClick: () => comingSoon(show, "Site Photos"),
    },
  };

  const visible = actions
    .map((key) => registry[key])
    .filter(Boolean);

  if (visible.length === 0) return null;

  return (
    <div className="quick-actions">
      {visible.map((action) => (
        <Button
          key={action.label}
          variant="secondary"
          onClick={action.onClick}
        >
          <action.icon size={16} aria-hidden="true" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
