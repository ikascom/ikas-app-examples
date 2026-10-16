import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { OctagonAlertIcon, RotateCwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"
import { Button } from "@/components/ui/button"

const emptyStateVariants = cva("flex w-full flex-col items-center text-center", {
  variants: {
    /** page for first run, section inside cards, inline in small panels. */
    size: {
      /** First run of a whole page, e.g. "No campaigns yet". */
      page: "gap-4 px-6 py-16",
      /** Inside a card or table with no results. */
      section: "gap-3 px-6 py-10",
      /** Inside small containers like popovers or side panels. */
      inline: "gap-2 px-4 py-6",
    },
  },
  defaultVariants: {
    size: "section",
  },
})

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof emptyStateVariants> & {
    /** A lucide icon element or a small illustration. */
    media?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    /** Primary action first, secondary second. */
    actions?: React.ReactNode
    /** Small print under the actions, e.g. a docs link. */
    footer?: React.ReactNode
    /**
     * danger: the view failed to load. Tints the media tile, defaults the icon
     * and announces the message (role="alert"). Pair it with `onRetry`.
     */
    status?: "neutral" | "danger"
    /** Shows a "Tekrar dene" button before `actions`. */
    onRetry?: () => void
    /** Label for the retry button. */
    retryLabel?: string
    /** Spinner on the retry button while the request runs. */
    retrying?: boolean
  }

/** No data yet, no results, or a failed load (status="danger"). */
function EmptyState({
  className,
  size = "section",
  media,
  title,
  description,
  actions,
  footer,
  status = "neutral",
  onRetry,
  retryLabel = "Tekrar dene",
  retrying = false,
  ...props
}: EmptyStateProps) {
  const danger = status === "danger"
  const icon = media ?? (danger ? <OctagonAlertIcon /> : null)

  return (
    <div
      data-slot="empty-state"
      data-size={size}
      data-status={status}
      role={danger ? "alert" : undefined}
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    >
      {icon && (
        <div
          data-slot="empty-state-media"
          className={cn(
            "flex items-center justify-center rounded-xl [&_svg]:shrink-0",
            danger
              ? cn(statusTint.danger, "bg-(--s-subtle) text-(--s-icon) shadow-[inset_0_0_0_1px_var(--s-border)]")
              : "border bg-muted text-icon",
            size === "page" && "size-14 [&_svg:not([class*='size-'])]:size-6",
            size === "section" && "size-11 [&_svg:not([class*='size-'])]:size-5",
            size === "inline" && "size-9 [&_svg:not([class*='size-'])]:size-4"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <h3
          className={cn(
            "font-heading font-semibold text-foreground",
            size === "page" ? "text-lg" : size === "section" ? "text-[15px]" : "text-sm"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className={cn("text-muted-foreground", size === "inline" ? "text-[13px]" : "text-sm")}>{description}</p>
        )}
      </div>
      {(onRetry || actions) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button variant="outline" size={size === "inline" ? "sm" : "default"} loading={retrying} onClick={onRetry}>
              <RotateCwIcon data-icon="inline-start" data-anim="spin" />
              {retryLabel}
            </Button>
          )}
          {actions}
        </div>
      )}
      {footer && <div className="text-[13px] text-muted-foreground [&_a]:text-primary [&_a]:hover:underline">{footer}</div>}
    </div>
  )
}

export { EmptyState, emptyStateVariants, type EmptyStateProps }
