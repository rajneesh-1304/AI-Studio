"use client";

import { Monitor, Smartphone } from "lucide-react";
import "./style.scss";

export function MobileBlocker() {
  return (
    <div className="mobile-blocker">
      <div className="mobile-icon-stack">
        <div className="mobile-monitor-box">
          <Monitor className="mobile-monitor-icon" />
        </div>
        <div className="mobile-phone-box">
          <Smartphone className="mobile-phone-icon" />
        </div>
      </div>

      <h1 className="mobile-heading">
        Desktop Required
      </h1>

      <p className="mobile-description">
        The workspace is designed for larger screens and requires a desktop or
        laptop to work properly.
      </p>
      <p className="mobile-subtext">
        Please open this page on a desktop browser for the best experience.
      </p>

      <div className="mobile-divider">
        <span className="divider-line" />
        <span className="divider-text">
          Switch to desktop
        </span>
        <span className="divider-line" />
      </div>
    </div>
  );
}

export default MobileBlocker;
