"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XIcon, OctagonAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"
import { Button } from "@/components/ui/button"

/**
 * Each status sets the shared --s-* tint variables (see @/lib/status); title,
 * body, links, icon and buttons in `actions` read only those.
 */
const bannerVariants = cva(
  [
    "group/banner relative flex w-full gap-3 rounded-xl p-3.5 text-sm",
    "[&>[data-slot=banner-icon]]:mt-px [&>[data-slot=banner-icon]]:size-4.5 [&>[data-slot=banner-icon]]:shrink-0 [&>[data-slot=banner-icon]]:text-(--s-icon)",
    "[&_a]:font-medium [&_a]:text-(--s-link) [&_a]:underline [&_a]:decoration-(--s-icon)/50 [&_a]:underline-offset-3 [&_a]:transition-colors [&_a:hover]:decoration-current",
  ],
  {
    variants: {
      /** Sets the icon and tint. Use danger for errors. */
      status: statusTint,
      /** soft for page-level messages, surface inside a section. */
      variant: {
        /**
         * Tinted fill, tinted text. Page-level messages that must be noticed.
         * Default-colored buttons in `actions` (and the close button) take the
         * status too: solid → status fill, soft/ghost → deeper tint, outline →
         * a translucent raised surface with a status hairline.
         */
        soft: [
          "bg-(--s-subtle) shadow-[inset_0_0_0_1px_var(--s-border)] [--s-link:var(--s-title)]",
          "[&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c:var(--s)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-fg:var(--s-fg)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-subtle:var(--s-hover)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-subtle-fg:var(--s-title)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-text:var(--s-title)]",
          "[&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral][data-variant=outline]]:bg-tint-surface [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral][data-variant=outline]]:shadow-[inset_0_0_0_1px_var(--s-border),0_1px_2px_0_var(--shade-1)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral][data-variant=outline]:hover]:bg-tint-surface-hover",
          // Focus ring in the status color: the default blue ring all but disappears on amber and red fills.
          "[&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]:focus-visible]:ring-(--s-icon)/50 [&>[data-banner-dismiss]:focus-visible]:ring-(--s-icon)/50",
        ],
        /** White card, colored icon, neutral text. Quieter, for messages inside a section. */
        surface:
          "bg-card shadow-card [--s-title:var(--foreground)] [--s-body:color-mix(in_oklab,var(--foreground)_80%,transparent)] [--s-link:var(--s-text)] [--s-hover:var(--muted)]",
      },
    },
    defaultVariants: {
      status: "info",
      variant: "soft",
    },
  }
)

const statusIcon = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  danger: OctagonAlertIcon,
  neutral: InfoIcon,
} as const

type BannerProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof bannerVariants> & {
    title?: React.ReactNode
    /** Replace the status icon. Pass `false` to hide it. */
    icon?: React.ReactNode | false
    /**
     * Buttons rendered under the content. Use size="sm" and leave `color` unset:
     * in the soft variant they pick up the banner's status.
     */
    actions?: React.ReactNode
    /** Shows a close button. */
    onDismiss?: () => void
  }

/** Persistent message the store owner should read or act on. */
function Banner({
  className,
  status = "info",
  variant = "soft",
  title,
  icon,
  actions,
  onDismiss,
  children,
  ...props
}: BannerProps) {
  const Icon = statusIcon[status ?? "info"]

  return (
    <div
      data-slot="banner"
      data-status={status}
      data-variant={variant}
      role={status === "danger" || status === "warning" ? "alert" : "status"}
      className={cn(bannerVariants({ status, variant }), onDismiss && "pr-10", className)}
      {...props}
    >
      {icon !== false && (icon ? <span data-slot="banner-icon">{icon}</span> : <Icon data-slot="banner-icon" aria-hidden />)}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && (
          <p data-slot="banner-title" className="font-medium text-(--s-title)">
            {title}
          </p>
        )}
        {children && (
          <div data-slot="banner-description" className="text-(--s-body)">
            {children}
          </div>
        )}
        {actions && (
          <div data-slot="banner-actions" className="mt-2 flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Kapat"
          data-banner-dismiss=""
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 [--c-subtle:var(--s-hover)] [--c-text:color-mix(in_oklab,var(--s-title)_60%,transparent)] hover:text-(--s-title)"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

export { Banner, bannerVariants, type BannerProps }
