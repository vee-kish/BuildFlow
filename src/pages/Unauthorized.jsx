import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import "./Unauthorized.css";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized">
      <Card className="unauthorized__card">
        <div className="unauthorized__body">
          <span className="unauthorized__icon" aria-hidden="true">
            <ShieldAlert size={32} />
          </span>
          <h1 className="unauthorized__title">You don't have access to this page</h1>
          <p className="unauthorized__text">
            Your current role doesn't include permission to view this area. If you
            think this is a mistake, ask your firm administrator to update your
            access, or switch to a demo role that has permission.
          </p>
          <div className="unauthorized__actions">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} aria-hidden="true" />
              Go back
            </Button>
            <Button variant="primary" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard size={16} aria-hidden="true" />
              Back to dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
