"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import styles from "../reviewer-dashboard.module.css";

type Active = "dashboard" | "report" | "candidate";

export function ReviewerShell({
  children,
  active
}: {
  children: ReactNode;
  active: Active;
}) {
  return (
    <main className={styles.appShell}>
      <div className={styles.browserBar}>
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={`${styles.dot} ${styles.yellow}`} />
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.browserTitle}>Reviewer Dashboard</span>
      </div>

      <div className="px-6 pt-6">
        <AppHeader pageTitle={active === "dashboard" ? "Dashboard" : active === "report" ? "Candidate Report" : "Candidate Information"} />
      </div>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <h2>Reviewer Menu</h2>

          <NavItem
            href="/reviewer-dashboard"
            active={active === "dashboard"}
            icon="▦"
          >
            Reviewer Dashboard
          </NavItem>

          <NavItem
            href="/reviewer-dashboard/candidate-report"
            active={active === "report"}
            icon="▣"
          >
            Candidate Report
          </NavItem>

          <NavItem
            href="/reviewer-dashboard/candidate-information"
            active={active === "candidate"}
            icon="♙"
          >
            Candidate Information
          </NavItem>
        </aside>

        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}

function NavItem({
  href,
  active,
  icon,
  children
}: {
  href: string;
  active: boolean;
  icon: string;
  children: ReactNode;
}) {
  return (
    <Link
      className={`${styles.navItem} ${active ? styles.navActive : ""}`}
      href={href}
    >
      <span className={styles.navIcon}>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}