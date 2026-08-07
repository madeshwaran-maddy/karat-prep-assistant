"use client";

interface SubmitButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onSubmit?: () => void;
}

export default function SubmitButton({
  disabled = false,
  loading = false,
  onSubmit,
}: SubmitButtonProps) {
  return (
    <div className="submit-container">
      <button
        className="submit-button"
        disabled={disabled || loading}
        onClick={onSubmit}
      >
        {loading ? "Evaluating..." : "Submit Fix"}
      </button>
    </div>
  );
}