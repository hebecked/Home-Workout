# Accessibility colour baseline

Changed: 2026-09-07

These values make the small category labels and normal-sized primary-button text meet WCAG 2 AA against white. Keep this table as the explicit rollback record.

| Use | Previous | Current | Contrast on white |
| --- | --- | --- | ---: |
| Primary / brand | `#5272df` | `#3554bd` | 6.66:1 |
| Primary hover / focus | `#3554bd` | `#27449f` | 8.70:1 |
| Legs | `#5ba4df` | `#1f6fa8` | 5.39:1 |
| Arms | `#d98836` | `#a65312` | 5.43:1 |
| Core | `#a779dc` | `#7140a1` | 7.12:1 |
| Cardio | `#e05f55` | `#b43d36` | 5.74:1 |
| Warm-up | `#b47d12` | `#846000` | 5.75:1 |
| Stretch | `#218b78` | `#176b5b` | 6.38:1 |

Disabled buttons use `#475467` text on `#e5e7eb`, without opacity, so their state remains legible. Restore the values in the **Previous** column to return to the former palette.
