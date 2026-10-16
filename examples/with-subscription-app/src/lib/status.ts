export const statusTint = {
  neutral:
    "[--s:var(--neutral)] [--s-fg:var(--neutral-foreground)] [--s-subtle:var(--muted)] [--s-text:var(--neutral-subtle-foreground)] [--s-border:var(--border)] [--s-icon:var(--icon)] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  info: "[--s:var(--info)] [--s-fg:var(--info-foreground)] [--s-subtle:var(--info-subtle)] [--s-text:var(--info-subtle-foreground)] [--s-border:var(--info-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  success:
    "[--s:var(--success)] [--s-fg:var(--success-foreground)] [--s-subtle:var(--success-subtle)] [--s-text:var(--success-subtle-foreground)] [--s-border:var(--success-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  warning:
    "[--s:var(--warning)] [--s-fg:var(--warning-foreground)] [--s-subtle:var(--warning-subtle)] [--s-text:var(--warning-subtle-foreground)] [--s-border:var(--warning-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  danger:
    "[--s:var(--danger)] [--s-fg:var(--danger-foreground)] [--s-subtle:var(--danger-subtle)] [--s-text:var(--danger-subtle-foreground)] [--s-border:var(--danger-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
} as const

export type Status = keyof typeof statusTint
