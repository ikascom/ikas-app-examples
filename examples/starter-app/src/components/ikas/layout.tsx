import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const layoutVariants = cva("grid w-full items-start gap-5", {
  variants: {
    /** Column split. Every option stacks to one column on mobile. */
    columns: {
      /** Single column stack. */
      one: "grid-cols-1",
      /** Main content plus a narrow aside (2/3 + 1/3). Detail pages. */
      "main-aside": "grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
      /** Two equal columns. */
      half: "grid-cols-1 md:grid-cols-2",
      /** Three equal columns. Stat rows, card grids. */
      third: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    },
  },
  defaultVariants: {
    columns: "one",
  },
})

/** Responsive grid of LayoutColumns inside a Page. */
function Layout({
  className,
  columns,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof layoutVariants>) {
  return (
    <div data-slot="layout" className={cn(layoutVariants({ columns }), className)} {...props} />
  )
}

function LayoutColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="layout-column" className={cn("flex min-w-0 flex-col gap-5", className)} {...props} />
  )
}

type SettingsGroupProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Group name, rendered as an h2. */
  label: React.ReactNode
  /** One or two sentences on what the settings in this group change. */
  hint?: React.ReactNode
  /** Optional step index shown above the label in mono, e.g. "01". Use it on long settings pages. */
  index?: string
}

/**
 * A group of related settings: label column on the left with a ruled top
 * edge, controls on the right. Stack several inside a narrow Page; number them
 * with `index` when the page has a section nav.
 */
function SettingsGroup({ className, label, hint, index, children, ...props }: SettingsGroupProps) {
  return (
    <section
      data-slot="settings-group"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8", className)}
      {...props}
    >
      <div
        data-slot="settings-group-label"
        className="relative flex flex-col gap-1 border-t border-border pt-3 before:absolute before:-top-px before:left-0 before:h-0.5 before:w-6 before:rounded-full before:bg-foreground"
      >
        {index && (
          <span data-slot="settings-group-index" className="font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
            {index}
          </span>
        )}
        <h2 className="font-heading text-[15px] font-semibold text-foreground">{label}</h2>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  )
}

export { Layout, LayoutColumn, SettingsGroup, layoutVariants, type SettingsGroupProps }
