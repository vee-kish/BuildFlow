import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { Topbar } from "../components/navigation/Topbar";
import { MobileNav } from "../components/navigation/MobileNav";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { cx } from "../utils/cx";
import "./AppLayout.css";

export function AppLayout() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [collapsed, setCollapsed] = useLocalStorage("bfk.sidebarCollapsed", false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer on navigation and when switching to desktop
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, isMobile]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  if (!user) return null;

  return (
    <div
      className={cx(
        "app-layout",
        !isMobile && collapsed && "app-layout--collapsed"
      )}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar
        role={user.role}
        collapsed={!isMobile && collapsed}
        onToggleCollapse={isMobile ? undefined : () => setCollapsed((v) => !v)}
        mobileOpen={isMobile && mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="app-layout__main">
        <Topbar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onToggleSidebar={isMobile ? undefined : () => setCollapsed((v) => !v)}
          sidebarCollapsed={collapsed}
        />
        <main id="main-content" className="app-layout__content">
          <Outlet />
        </main>
      </div>

      <MobileNav role={user.role} />
    </div>
  );
}
