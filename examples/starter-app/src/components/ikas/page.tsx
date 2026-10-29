import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const pageVariants = cva("mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6", {
  variants: {
    /** Max content width. narrow for settings, wide for tables. */
    width: {
      /** Forms and settings. Keeps line length readable. */
      narrow: "max-w-3xl",
      /** Most app screens. */
      default: "max-w-5xl",
      /** Tables with many columns, dashboards. */
      wide: "max-w-7xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    width: "default",
  },
})

/** Outer frame of every app screen. Holds a PageHeader and content. */
function Page({
  className,
  width,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof pageVariants>) {
  return (
    <div
      data-slot="page"
      data-width={width ?? "default"}
      className={cn(pageVariants({ width }), className)}
      {...props}
    />
  )
}

type PageHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Badges or meta shown next to the title, e.g. order status. */
  badges?: React.ReactNode
  /** Renders a back button. Pass an element (e.g. next/link) via `back.asChild`. */
  back?:
    | { label?: string; onClick: () => void }
    | { label?: string; href: string; asChild?: false }
    | { label?: string; children: React.ReactElement; asChild: true }
  /** Right aligned actions. Put the primary button last. */
  actions?: React.ReactNode
}

/** Title row of a Page with back link, badges and actions. */
function PageHeader({
  className,
  title,
  description,
  badges,
  back,
  actions,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        {back && <PageBackButton {...back} />}
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-h-8 flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="truncate font-heading text-xl font-semibold tracking-[-0.01em] text-foreground">
              {title}
            </h1>
            {badges}
          </div>
          {description && (
            <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div data-slot="page-header-actions" className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}

function PageBackButton(props: NonNullable<PageHeaderProps["back"]>) {
  const label = props.label ?? "Geri"
  const icon = <ArrowLeftIcon />

  if ("asChild" in props && props.asChild) {
    return (
      <Button variant="outline" size="icon-sm" aria-label={label} asChild>
        {React.cloneElement(props.children, undefined, icon)}
      </Button>
    )
  }
  if ("href" in props) {
    return (
      <Button variant="outline" size="icon-sm" aria-label={label} asChild>
        <a href={props.href}>{icon}</a>
      </Button>
    )
  }
  return (
    <Button variant="outline" size="icon-sm" aria-label={label} onClick={props.onClick}>
      {icon}
    </Button>
  )
}

export { Page, PageHeader, pageVariants, type PageHeaderProps }
