"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { EASE_OUT, ICON_SPRING, INSTANT } from "@/lib/motion"
import { Button, type ButtonProps } from "@/components/ui/button"

/** A check mark that draws itself and pops in when it mounts. */
function AnimatedCheckIcon({ className, strokeWidth = 2.25 }: { className?: string; strokeWidth?: number }) {
  const reduce = useReducedMotion()

  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      initial={reduce ? false : { scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={reduce ? INSTANT : ICON_SPRING}
      className={cn("size-4", className)}
    >
      <motion.path
        d="M4.5 12.75l5 5 10-11.5"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduce ? INSTANT : { duration: 0.25, ease: EASE_OUT }}
      />
    </motion.svg>
  )
}

type CopyIconButtonProps = Omit<ButtonProps, "onClick" | "children" | "asChild"> & {
  /** Text copied to the clipboard. */
  value: string
  /** Accessible label before copying. */
  label?: string
}

/** Icon button that copies `value` and swaps to a drawn check for 1.5s. */
function CopyIconButton({ value, label = "Kopyala", variant = "ghost", size = "icon-sm", className, ...props }: CopyIconButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [copied])

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.8, filter: "blur(2px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.8, filter: "blur(2px)" },
      }

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      aria-label={copied ? "Kopyalandı" : label}
      className={cn(copied && "text-success", className)}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => setCopied(true),
          () => setCopied(true)
        )
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={copied ? "check" : "copy"} {...swap} transition={{ duration: 0.15, ease: EASE_OUT }} className="flex">
          {copied ? <AnimatedCheckIcon /> : <CopyIcon />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export { AnimatedCheckIcon, CopyIconButton, type CopyIconButtonProps }
