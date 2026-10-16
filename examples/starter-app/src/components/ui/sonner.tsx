"use client"

import * as React from "react"
import { Toaster as Sonner, useSonner, type ToasterProps as SonnerProps } from "sonner"
import { AlertTriangleIcon, InfoIcon, OctagonAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AnimatedCheckIcon } from "@/components/ikas/animated-check"

type ToasterProps = SonnerProps & {
  /**
   * surface: popover card, the status in the icon (plus a thin leading accent for
   * warning and error). soft: tinted with the status like a soft Banner; use sparingly.
   */
  variant?: "surface" | "soft"
  /** 2px bar that counts down each toast's duration. Pauses on hover, hidden with reduced motion. */
  progress?: boolean
}

const DEFAULT_DURATION = 4000

/** Follows the `dark` class on <html>, so toasts match the app without a theme provider. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}
const getTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light")
const getServerTheme = () => "light" as const

/**
 * Progress bar: a gradient on the content's ::after, which spans the whole toast.
 * Sonner keeps a toast's duration out of the DOM, so each toast gets its duration
 * through its place in the list (data-index), read from the toast store.
 */
function useProgressCss(scope: string, enabled: boolean, props: ToasterProps) {
  const { toasts } = useSonner()
  if (!enabled) return null
  const fallback = props.toastOptions?.duration ?? props.duration ?? DEFAULT_DURATION
  const position = props.position ?? "bottom-right"
  const indexes = new Map<string, number>()
  const rules: string[] = []
  for (const t of toasts) {
    if (props.id ? t.toasterId !== props.id : t.toasterId) continue
    const at = t.position ?? position
    const index = indexes.get(at) ?? 0
    indexes.set(at, index + 1)
    const duration = t.duration ?? fallback
    if (t.type === "loading" || !Number.isFinite(duration)) continue
    const [y, x] = at.split("-")
    rules.push(
      `.${scope}[data-y-position="${y}"][data-x-position="${x}"]>[data-index="${index}"]:not([data-type="loading"])>[data-content]::after{display:block;animation-duration:${duration}ms}`
    )
  }
  return [
    `.${scope} [data-content]::after{content:"";display:none;position:absolute;inset:0;border-radius:calc(var(--radius) * 1.4);pointer-events:none;background:linear-gradient(var(--s-icon),var(--s-icon)) left bottom / 0 2px no-repeat;animation:ikas-toast-progress 0ms linear forwards}`,
    `.${scope}:hover [data-content]::after{animation-play-state:paused}`,
    `@keyframes ikas-toast-progress{from{background-size:100% 2px}to{background-size:0 2px}}`,
    `@media (prefers-reduced-motion:no-preference){${rules.join("")}}`,
  ].join("\n")
}

/**
 * Sonner, unstyled and dressed in ikas tokens with the same status recipe as
 * Banner (@/lib/status). Use it for confirmations that need no follow-up
 * ("Kaydedildi"); anything the store owner must act on belongs in a Banner.
 */
function Toaster({ variant = "surface", progress = false, className, theme, toastOptions, ...props }: ToasterProps) {
  const documentTheme = React.useSyncExternalStore(subscribeTheme, getTheme, getServerTheme)
  const scope = `ikas-toaster-${React.useId().replace(/[^\w-]/g, "")}`
  const progressCss = useProgressCss(scope, progress, { ...props, toastOptions })
  const soft = variant === "soft"
  // Surface only: warning and error get a 3px accent on the leading edge.
  const accent = soft ? undefined : "[--t-accent:var(--s)]"

  return (
    <>
      {progressCss && <style>{progressCss}</style>}
      <Sonner
        theme={theme ?? documentTheme}
        position="bottom-right"
        gap={10}
        visibleToasts={3}
        className={cn("toaster group", scope, className)}
        icons={{
          success: (
            <span className="flex size-4.5 items-center justify-center rounded-full bg-(--s-icon) text-(--s-fg)">
              <AnimatedCheckIcon className="size-3" strokeWidth={3} />
            </span>
          ),
          info: <InfoIcon className="size-4.5 text-(--s-icon)" />,
          warning: <AlertTriangleIcon className="size-4.5 text-(--s-icon)" />,
          error: <OctagonAlertIcon className="size-4.5 text-(--s-icon)" />,
          loading: <Spinner className="size-4 text-icon" />,
        }}
        toastOptions={{
          ...toastOptions,
          unstyled: true,
          classNames: {
            toast: cn(
              "group/toast flex w-full items-start gap-3 rounded-xl py-3 pr-3 pl-3.5 text-sm sm:w-[360px]",
              soft
                ? "bg-(--s-subtle) text-(--s-title) shadow-[inset_0_0_0_1px_var(--s-border),0_12px_32px_-8px_var(--shade-3),0_4px_10px_-4px_var(--shade-2)]"
                : "bg-popover text-popover-foreground shadow-[inset_3px_0_0_0_var(--t-accent,transparent),0_0_0_1px_var(--shade-border),0_12px_32px_-8px_var(--shade-3),0_4px_10px_-4px_var(--shade-2)]",
              // Plain toast(): no icon, keep the text aligned with the surface edge.
              "has-[[data-icon]:empty]:pl-4",
              // Collapsed stack: the toasts behind the front one show only their edge.
              "data-[expanded=false]:data-[front=false]:[&>*]:opacity-0"
            ),
            default: statusTint.neutral,
            loading: statusTint.neutral,
            success: statusTint.success,
            info: statusTint.info,
            warning: cn(statusTint.warning, accent),
            error: cn(statusTint.danger, accent),
            icon: "relative mt-px flex size-4.5 shrink-0 items-center justify-center [&:empty]:hidden",
            content: "flex min-w-0 flex-1 flex-col gap-0.5 py-px",
            title: "font-medium leading-5",
            // `!`: Sonner's dark theme sets its own description color with a stronger selector.
            description: cn("text-[13px] leading-5", soft ? "text-(--s-body)!" : "text-muted-foreground!"),
            // Like Banner actions: a neutral outline on the card, a tinted raised surface on soft.
            actionButton: soft
              ? cn(
                  buttonVariants({ variant: "ghost", size: "xs" }),
                  "ml-1 shrink-0 self-center bg-tint-surface shadow-[inset_0_0_0_1px_var(--s-border),0_1px_2px_0_var(--shade-1)] [--c-text:var(--s-title)] hover:bg-tint-surface-hover focus-visible:ring-(--s-icon)/50"
                )
              : cn(buttonVariants({ variant: "outline", size: "xs" }), "ml-1 shrink-0 self-center"),
            cancelButton: cn(
              buttonVariants({ variant: "ghost", size: "xs" }),
              "shrink-0 self-center",
              soft ? "[--c-subtle:var(--s-hover)] [--c-text:var(--s-body)]" : "text-muted-foreground"
            ),
            closeButton:
              "absolute top-2 right-2 flex size-6 items-center justify-center rounded-md border-0! bg-transparent! text-icon! transition-colors hover:bg-(--s-hover)! hover:text-foreground! [&_svg]:size-3.5",
            ...toastOptions?.classNames,
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster, type ToasterProps }
