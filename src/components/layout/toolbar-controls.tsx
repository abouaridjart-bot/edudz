import { LocaleSwitch } from "./locale-switch";
import { ThemeToggle } from "./theme-toggle";

export function ToolbarControls() {
  return (
    <div className="flex items-center gap-1">
      <LocaleSwitch />
      <ThemeToggle />
    </div>
  );
}
