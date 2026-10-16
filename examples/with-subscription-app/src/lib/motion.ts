import type { Transition } from "motion/react"

/**
 * Motion tokens. The single source for every spring and curve in the app:
 * components never hand-write their own. The CSS mirrors (--ease-*) live in
 * the theme, so Tailwind classes and motion/react stay in sync.
 */

/** ζ≈0.94, no overshoot, settles in ~230ms. Pills, morphs, enter/exit, numbers. */
export const SPRING: Transition = { type: "spring", stiffness: 350, damping: 35 }

/** ζ≈0.75, ~3% overshoot. Icons only, so they feel a little alive. */
export const ICON_SPRING: Transition = { type: "spring", stiffness: 350, damping: 28 }

/** The reduced-motion branch. */
export const INSTANT: Transition = { duration: 0 }

/** Things entering or leaving the screen. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const
/** Things that move or change shape on screen. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
/** Overlays that grow out of their trigger (dialogs, popovers). */
export const EASE_REVEAL = [0.33, 1, 0.68, 1] as const
/** Sheets, drawers, sidebars. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

export const springOrInstant = (reduce: boolean | null): Transition => (reduce ? INSTANT : SPRING)

/** Fade timings for content that appears inside an expanding container. */
export const FADE_IN: Transition = { duration: 0.15, ease: EASE_OUT }
export const FADE_OUT: Transition = { duration: 0.1, ease: EASE_OUT }
