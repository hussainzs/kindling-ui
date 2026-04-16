import { AlertTriangle } from 'lucide-react';

type NotebookErrorToastProps = {
  message: string;
};

export default function NotebookErrorToast({
  message,
}: NotebookErrorToastProps) {
  return (
    <div
      className="notebook-error-toast"
      role="status"
      aria-live="polite"
      aria-label="Milestone suggestion status"
    >
      <AlertTriangle className="icon icon-sm notebook-error-toast-icon" />
      <p className="notebook-error-toast-message text-caption">{message}</p>
    </div>
  );
}
