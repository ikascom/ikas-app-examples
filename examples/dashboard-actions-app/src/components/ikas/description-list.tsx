import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const descriptionListVariants = cva("w-full text-sm", {
  variants: {
    /** horizontal for details in a card, stacked for narrow asides. */
    layout: {
      /** Label left, value right. Order and customer details. */
      horizontal: "divide-y divide-border [&>div]:grid [&>div]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] [&>div]:gap-4 [&>div]:py-2.5",
      /** Label above value. Narrow asides. */
      stacked: "flex flex-col gap-3.5 [&>div]:flex [&>div]:flex-col [&>div]:gap-0.5",
    },
  },
  defaultVariants: {
    layout: "horizontal",
  },
})

type DescriptionListItem = {
  label: React.ReactNode
  value: React.ReactNode
  key?: React.Key
}

type DescriptionListProps = React.ComponentProps<"dl"> &
  VariantProps<typeof descriptionListVariants> & {
    items: DescriptionListItem[]
  }

/** Read-only label and value pairs, like order or customer details. */
function DescriptionList({ className, layout, items, ...props }: DescriptionListProps) {
  return (
    <dl data-slot="description-list" className={cn(descriptionListVariants({ layout }), className)} {...props}>
      {items.map((item, index) => (
        <div key={item.key ?? index} className="first:pt-0 last:pb-0">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-foreground [overflow-wrap:anywhere]">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  )
}

export { DescriptionList, descriptionListVariants, type DescriptionListItem, type DescriptionListProps }
