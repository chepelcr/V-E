import type { ComponentType } from "react";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  HardHat,
  ShieldCheck,
  Handshake,
  Star,
  Phone,
  Mail,
  CreditCard,
  Home,
  Gift,
  Wrench,
  Layers,
  AlertCircle,
  Building2,
  Hammer,
  Ruler,
  MapPin,
  KeyRound,
  Sparkles,
} from "lucide-react";

export type IconComponent = ComponentType<{
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}>;

/**
 * Registry of icons selectable from content/admin (e.g. `service.iconName`,
 * `value.iconName`, `financingOption.iconName`). Keep this the single source of
 * truth so the editable `iconName` field stays in sync with what the public
 * site can render. Names are kebab-case content tokens; values are the
 * lucide-react components.
 */
export const ICONS: Record<string, IconComponent> = {
  "arrow-right": ArrowRight,
  "check-circle": CheckCircle2,
  "trending-up": TrendingUp,
  "hard-hat": HardHat,
  "shield-check": ShieldCheck,
  handshake: Handshake,
  star: Star,
  phone: Phone,
  mail: Mail,
  "credit-card": CreditCard,
  home: Home,
  gift: Gift,
  wrench: Wrench,
  layers: Layers,
  "alert-circle": AlertCircle,
  building: Building2,
  hammer: Hammer,
  ruler: Ruler,
  "map-pin": MapPin,
  key: KeyRound,
  sparkles: Sparkles,
};

/** Valid icon names, handy for admin <select> dropdowns. */
export const ICON_NAMES = Object.keys(ICONS);

/** Resolve an icon name to a component, falling back to a sensible default. */
export function resolveIcon(
  name: string | null | undefined,
  fallback: IconComponent = ArrowRight,
): IconComponent {
  return (name && ICONS[name]) || fallback;
}
