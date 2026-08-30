export type StepNavDirection = "forward" | "back";

const NAV_KEY = "genoroot-step-nav";

export function setStepNavDirection(direction: StepNavDirection): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NAV_KEY, direction);
}

export function consumeStepNavDirection(): StepNavDirection {
  if (typeof window === "undefined") return "forward";
  const direction = sessionStorage.getItem(NAV_KEY);
  sessionStorage.removeItem(NAV_KEY);
  return direction === "back" ? "back" : "forward";
}
