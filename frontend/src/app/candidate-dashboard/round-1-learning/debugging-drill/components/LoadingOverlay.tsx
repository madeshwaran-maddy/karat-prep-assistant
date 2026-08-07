"use client";

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible = false,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">

      <div className="loading-card">

        <div className="loading-spinner" />

        <div className="loading-text">
          {message}
        </div>

      </div>

    </div>
  );
}