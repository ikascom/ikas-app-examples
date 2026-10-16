"use client"

import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { springOrInstant } from "@/lib/motion"

type SegmentedControlOption<T extends string> = {
  value: T
  label?: React.ReactNode
  /** Count or status shown after the label, e.g. pending items. */
  badge?: React.ReactNode
  icon?: React.ReactNode
  /** Required when the option is icon-only. */
  "aria-label"?: string
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[]
  value: T
  onValueChange: (value: T) => void
  /** sm (32px) for card headers and toolbars, default (36px) for page level. */
  size?: "sm" | "default"
  /** tabs switches views (tablist), radio picks a value (radiogroup). */
  mode?: "tabs" | "radio"
  className?: string
  "aria-label"?: string
}

/**
 * Single choice from 2–5 options. The active segment is a raised pill that
 * slides to the selection.
 */
function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = "default",
  mode = "tabs",
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const id = React.useId()
  const reduce = useReducedMotion()
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let next: number | undefined
    if (event.key in keys) next = (index + keys[event.key] + options.length) % options.length
    if (event.key === "Home") next = 0
    if (event.key === "End") next = options.length - 1
    if (next === undefined) return
    event.preventDefault()
    refs.current[next]?.focus()
    onValueChange(options[next].value)
  }

  return (
    <LayoutGroup id={id}>
      <div
        data-slot="segmented-control"
        role={mode === "tabs" ? "tablist" : "radiogroup"}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-foreground/[0.05] p-[3px] shadow-[inset_0_1px_2px_0_var(--shade-1)] [scrollbar-width:none]",
          size === "sm" ? "h-8" : "h-9",
          className
        )}
      >
        {options.map((option, index) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node
              }}
              type="button"
              role={mode === "tabs" ? "tab" : "radio"}
              aria-selected={mode === "tabs" ? active : undefined}
              aria-checked={mode === "radio" ? active : undefined}
              aria-label={option["aria-label"]}
              tabIndex={active ? 0 : -1}
              onClick={() => onValueChange(option.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative flex h-full shrink-0 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-[color,scale] duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-[0.98] motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                size === "sm" ? "px-2.5 text-[13px]" : "px-3 text-sm",
                !option.label && (size === "sm" ? "w-[26px] px-0" : "w-[30px] px-0"),
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="segmented-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-md bg-card shadow-raised"
                  transition={springOrInstant(reduce)}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {option.icon}
                {option.label}
                {option.badge !== undefined && (
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums transition-colors",
                      active ? "bg-foreground text-background" : "bg-foreground/10 text-muted-foreground"
                    )}
                  >
                    {option.badge}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export { SegmentedControl, type SegmentedControlProps, type SegmentedControlOption }
