import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const colors = {
  neutral:
    "[--c:var(--icon)] [--c-solid:var(--neutral)] [--c-fg:var(--neutral-foreground)] [--c-subtle:var(--neutral-subtle)] [--c-subtle-fg:var(--neutral-subtle-foreground)] [--c-border:var(--neutral-border)]",
  blue: "[--c:var(--blue)] [--c-solid:var(--blue)] [--c-fg:var(--blue-foreground)] [--c-subtle:var(--blue-subtle)] [--c-subtle-fg:var(--blue-subtle-foreground)] [--c-border:var(--blue-border)]",
  violet:
    "[--c:var(--violet)] [--c-solid:var(--violet)] [--c-fg:var(--violet-foreground)] [--c-subtle:var(--violet-subtle)] [--c-subtle-fg:var(--violet-subtle-foreground)] [--c-border:var(--violet-border)]",
  green:
    "[--c:var(--green)] [--c-solid:var(--green)] [--c-fg:var(--green-foreground)] [--c-subtle:var(--green-subtle)] [--c-subtle-fg:var(--green-subtle-foreground)] [--c-border:var(--green-border)]",
  lime: "[--c:var(--lime)] [--c-solid:var(--lime)] [--c-fg:var(--lime-foreground)] [--c-subtle:var(--lime-subtle)] [--c-subtle-fg:var(--lime-subtle-foreground)] [--c-border:var(--lime-border)]",
  amber:
    "[--c:var(--amber)] [--c-solid:var(--amber)] [--c-fg:var(--amber-foreground)] [--c-subtle:var(--amber-subtle)] [--c-subtle-fg:var(--amber-subtle-foreground)] [--c-border:var(--amber-border)]",
  red: "[--c:var(--red)] [--c-solid:var(--red)] [--c-fg:var(--red-foreground)] [--c-subtle:var(--red-subtle)] [--c-subtle-fg:var(--red-subtle-foreground)] [--c-border:var(--red-border)]",
} as const

type BadgeColor = keyof typeof colors

/** Status colors. Prefer these for statuses so meaning stays consistent across apps. */
const statusColor = {
  neutral: "neutral",
  info: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
} as const satisfies Record<string, BadgeColor>

type BadgeStatus = keyof typeof statusColor

const badgeVariants = cva(
  // Dot: halfway between the solid color and the tinted text, so amber and lime stay 3:1 on white and on their fill.
  "[--c-dot:color-mix(in_oklab,var(--c)_50%,var(--c-subtle-fg))] group/badge inline-flex h-5.5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md px-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      /** soft for list statuses, solid to stand out, surface for dense tables. */
      variant: {
        /** Tinted fill with a hairline ring. The default for statuses in lists. */
        soft: "bg-(--c-subtle) text-(--c-subtle-fg) shadow-[inset_0_0_0_1px_var(--c-border)]",
        /** Filled. Counts and the one status that must stand out. */
        solid: "bg-(--c-solid) text-(--c-fg) shadow-[inset_0_1px_0_0_rgb(255_255_255/0.18)]",
        /** White surface, neutral text, colored dot. Quiet, for dense tables. */
        surface: "bg-card text-foreground shadow-raised",
      },
      /** Raw palette color. Prefer `status` for statuses. */
      color: colors,
      size: {
        sm: "h-5 gap-1 px-1.5 text-[11px]",
        default: "",
      },
    },
    defaultVariants: {
      variant: "soft",
      color: "neutral",
      size: "default",
    },
  }
)

type BadgeProps = Omit<React.ComponentProps<"span">, "color"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** Semantic status. Maps to a palette color; `color` wins when both are set. */
    status?: BadgeStatus
    /** Leading status dot. Always shown for the surface variant. */
    dot?: boolean
  }

function Badge({ className, status = "neutral", color, variant = "soft", size, dot = false, asChild = false, children, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  const resolved = color ?? statusColor[status]
  const showDot = !asChild && (dot || variant === "surface")

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-color={resolved}
      className={cn(badgeVariants({ variant, color: resolved, size }), className)}
      {...props}
    >
      {showDot && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", variant === "solid" ? "bg-current/80" : "bg-(--c-dot)")} />}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants, type BadgeProps, type BadgeStatus, type BadgeColor }
