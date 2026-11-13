// The surrounding Headless UI Radio owns role, focus and checked state. This
// visual mark must not introduce a second focusable radio inside that control.
export default function Radio({
  checked,
  "data-testid": testId,
}: {
  checked: boolean
  "data-testid"?: string
}) {
  return (
    <span
      aria-hidden="true"
      data-testid={testId || "radio-button"}
      data-state={checked ? "checked" : "unchecked"}
      className="forme-radio-mark"
    >
      <span />
    </span>
  )
}
