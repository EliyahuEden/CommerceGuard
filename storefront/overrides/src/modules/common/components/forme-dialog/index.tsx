"use client"
import { useId, useRef } from "react"
export default function FormeDialog({
  label,
  children,
  className = "",
  trigger,
}: {
  label: string
  children: React.ReactNode
  className?: string
  trigger: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const heading = useId()
  return (
    <>
      <button
        type="button"
        className={`forme-dialog-trigger ${className}`}
        onClick={() => ref.current?.showModal()}
        aria-haspopup="dialog"
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        className="forme-dialog"
        aria-labelledby={heading}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
            ),
          ).filter((control) => control.getClientRects().length)
          const first = controls[0],
            last = controls[controls.length - 1]
          if (
            first &&
            (controls.length === 1 ||
              (event.shiftKey && document.activeElement === first) ||
              (!event.shiftKey && document.activeElement === last))
          ) {
            event.preventDefault()
            const next = event.shiftKey ? last : first
            next.focus()
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) ref.current?.close()
        }}
      >
        <div className="forme-dialog-content">
          <div className="forme-dialog-heading">
            <h2 id={heading}>{label}</h2>
            <button
              type="button"
              className="forme-dialog-close"
              aria-label={`Close ${label}`}
              onClick={() => ref.current?.close()}
              autoFocus
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  )
}
