import { ArrowLeft, Home, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";

export default function FloatingWorkflowNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const onBack = () => {
    if (location.pathname === "/") {
      return;
    }

    navigate(-1);
  };

  const onHome = () => {
    navigate("/");
    setIsOpen(false);
  };

  const toggleNav = () => {
    setIsOpen((open) => !open);
  };

  return (
    <div className="fixed left-4 top-4 z-50">
      <div className="relative flex items-center">
        <button
          type="button"
          className="surface-nav border-divider relative z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-card"
          onClick={toggleNav}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <Menu className="icon icon-rust" />
        </button>

        <div
          className={`surface-nav border-divider absolute left-0 z-10 flex items-center gap-2 overflow-hidden rounded-full border py-2 shadow-card transition-all duration-300 ${
            isOpen ? "max-w-64 pl-12 pr-3 opacity-100" : "max-w-0 px-0 opacity-0"
          }`}
          aria-hidden={!isOpen}
        >
          <button
            type="button"
            className="btn btn-secondary h-9 rounded-full px-3 text-sm"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="icon icon-sm" />
            Back
          </button>

          <button
            type="button"
            className="btn btn-primary h-9 rounded-full px-3 text-sm"
            onClick={onHome}
            aria-label="Go home"
          >
            <Home className="icon icon-sm" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
