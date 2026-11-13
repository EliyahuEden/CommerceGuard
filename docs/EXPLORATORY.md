# Exploratory testing charters

These are planned sessions. No exploratory execution or defect is implied.

| Charter                  | Time box | Mission / data                                                                                                           | Observations to record                                                                                           |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Money across transitions | 45 min   | Add/remove/change quantities, promotion on/off, shipping changes, browser Back and reload. Use EUR 10 variants and CG10. | Every displayed amount vs independent arithmetic and API; rounding, stale summary, request ordering              |
| Identity boundaries      | 45 min   | Two fresh accounts and an anonymous context; edit profile/address, try foreign IDs, logout/revisit history.              | Exposure of personal fields, misleading errors, cached identity after logout; exact requests with test-only data |
| Checkout resilience      | 45 min   | Incomplete address, invalid email, repeated click, browser refresh at payment/review, local backend interruption.        | Recovery path, preserved cart, duplicate or absent order, actionable messages; no real payment credentials       |
| Search and navigation    | 30 min   | Query, clear, combine category/option/price filters; back/forward and paste URL.                                         | Filter state and count consistency; unreachable products, broken empty states, console errors                    |
| Mobile and keyboard      | 45 min   | Pixel viewport plus real device when available; tab/shift-tab, screen zoom, long names/addresses.                        | Focus order, inaccessible unlabeled controls, off-screen submit buttons, viewport overflow, touch interactions   |

Enhancement charters (planned, not signed off):

- **Saved products and identity, 45 min:** save as guest, log into two accounts,
  expire the session, reject a metadata write, open competing tabs and reach the
  100-item bound. Record retained guest data, account isolation, error recovery
  and the documented last-write-wins behavior.
- **Order reuse and availability, 45 min:** reorder an owned order after changing
  stock/price through supported local workflows, with an existing bag present.
  Record current pricing, unavailable-item errors, preserved bag and order count.
- **Assistive technology, 45 min:** use a real screen reader and 320px reflow/zoom,
  inspect guide/zoom dialogs, invalid address summaries and the complete checkout.
  Record actual announcements and focus, rather than inferring them from axe.

Session record template: date/build/browser, charter, test-data IDs, notes/timestamps,
coverage achieved, questions, defect links and debrief. Record observations before
classifying them. Label intentionally injected mutations separately from discoveries.
