import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

/**
 * Each color points the local --c-* variables at one palette color. Variants
 * only read --c-*, so any variant works with any color.
 */
const colors = {
  neutral:
    "[--c:var(--neutral)] [--c-fg:var(--neutral-foreground)] [--c-subtle:var(--neutral-subtle)] [--c-subtle-fg:var(--neutral-subtle-foreground)] [--c-text:var(--foreground)]",
  blue: "[--c:var(--blue)] [--c-fg:var(--blue-foreground)] [--c-subtle:var(--blue-subtle)] [--c-subtle-fg:var(--blue-subtle-foreground)] [--c-text:var(--blue-subtle-foreground)]",
  violet:
    "[--c:var(--violet)] [--c-fg:var(--violet-foreground)] [--c-subtle:var(--violet-subtle)] [--c-subtle-fg:var(--violet-subtle-foreground)] [--c-text:var(--violet-subtle-foreground)]",
  green:
    "[--c:var(--green)] [--c-fg:var(--green-foreground)] [--c-subtle:var(--green-subtle)] [--c-subtle-fg:var(--green-subtle-foreground)] [--c-text:var(--green-subtle-foreground)]",
  lime: "[--c:var(--lime)] [--c-fg:var(--lime-foreground)] [--c-subtle:var(--lime-subtle)] [--c-subtle-fg:var(--lime-subtle-foreground)] [--c-text:var(--lime-subtle-foreground)]",
  amber:
    "[--c:var(--amber)] [--c-fg:var(--amber-foreground)] [--c-subtle:var(--amber-subtle)] [--c-subtle-fg:var(--amber-subtle-foreground)] [--c-text:var(--amber-subtle-foreground)]",
  red: "[--c:var(--red)] [--c-fg:var(--red-foreground)] [--c-subtle:var(--red-subtle)] [--c-subtle-fg:var(--red-subtle-foreground)] [--c-text:var(--red-subtle-foreground)]",
} as const

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow,translate,scale] duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-busy:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /** Filled, raised and softly glowing in its own color. The main action of a view. */
        solid:
          "bg-(--c) bg-linear-to-b from-white/14 to-transparent text-(--c-fg) shadow-solid hover:bg-[color-mix(in_oklab,var(--c),white_7%)] hover:shadow-solid-hover active:translate-y-px active:bg-none active:shadow-pressed",
        /** Tinted fill, no elevation. Secondary actions that still carry color. */
        soft: "bg-(--c-subtle) text-(--c-subtle-fg) hover:bg-[color-mix(in_oklab,var(--c-subtle),var(--c)_9%)] active:bg-[color-mix(in_oklab,var(--c-subtle),var(--c)_14%)] aria-expanded:bg-[color-mix(in_oklab,var(--c-subtle),var(--c)_9%)]",
        /** White raised surface. Neutral actions next to a solid one: Cancel, Export, Edit. */
        outline:
          "bg-card text-(--c-text) shadow-raised hover:bg-[color-mix(in_oklab,var(--card),var(--foreground)_3%)] hover:shadow-raised-hover active:translate-y-px active:shadow-inset aria-expanded:bg-muted",
        /** No container. Toolbars, table rows and icon buttons. */
        ghost:
          "text-(--c-text) hover:bg-(--c-subtle) active:bg-[color-mix(in_oklab,var(--c-subtle),var(--c)_8%)] aria-expanded:bg-(--c-subtle)",
        link: "h-auto! px-0! text-(--c-text) underline decoration-current/30 underline-offset-4 hover:decoration-current",
      },
      /** Palette color. Works with every variant. Use red for destructive actions. */
      color: colors,
      size: {
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        default: "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "solid",
      color: "neutral",
      size: "default",
    },
  }
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type ButtonColor = keyof typeof colors

/** shadcn/ui variant names, kept so blocks written for stock shadcn keep working. */
const aliases = {
  default: { variant: "solid" },
  secondary: { variant: "soft" },
  destructive: { variant: "solid", color: "red" },
  "destructive-outline": { variant: "outline", color: "red" },
} as const satisfies Record<string, { variant: ButtonVariant; color?: ButtonColor }>

type ButtonProps = Omit<React.ComponentProps<"button">, "color"> &
  Omit<VariantProps<typeof buttonVariants>, "variant"> & {
    /** solid for the main action. shadcn names like destructive still work. */
    variant?: ButtonVariant | keyof typeof aliases
    asChild?: boolean
    /** Shows a spinner, keeps the button width and blocks clicks. */
    loading?: boolean
  }

function resolveVariant(variant: ButtonProps["variant"], color: ButtonProps["color"]) {
  if (variant && variant in aliases) {
    const alias: { variant: ButtonVariant; color?: ButtonColor } = aliases[variant as keyof typeof aliases]
    return { variant: alias.variant, color: color ?? alias.color ?? "neutral" }
  }
  return { variant: (variant ?? "solid") as ButtonVariant, color: color ?? "neutral" }
}

function Button({
  className,
  variant: variantProp,
  color: colorProp,
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const { variant, color } = resolveVariant(variantProp, colorProp)

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-color={color}
      data-size={size}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled}
      className={cn(buttonVariants({ variant, color, size, className }))}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <span className="invisible contents">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps, type ButtonColor, type ButtonVariant }
