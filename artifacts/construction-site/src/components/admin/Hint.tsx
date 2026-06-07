import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * Styled tooltip over the shadcn/Radix `Tooltip`. `TooltipContent` is portaled
 * (see `components/ui/tooltip.tsx`) so it renders above the sidebar's overflow
 * clipping. The single root `TooltipProvider` lives in `App.tsx`.
 *
 * IMPORTANT: the `asChild` trigger MUST wrap a NATIVE `<button>`/`<a>` (never a
 * wouter `<Link>`), otherwise Radix can't attach its ref/handlers. Pass
 * `disabled` to render children without a tooltip (e.g. when the sidebar is
 * expanded and labels are already visible).
 */
export function Hint({
  label,
  side = "right",
  disabled = false,
  children,
}: {
  label: string;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
