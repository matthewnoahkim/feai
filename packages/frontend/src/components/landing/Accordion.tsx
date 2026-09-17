'use client'

import { useState } from 'react'

/** Click-to-expand FAQ list. Panels animate with a grid-template-rows 0fr→1fr trick instead
 * of max-height, so the open height doesn't need to be measured or guessed for text that
 * wraps differently at each breakpoint. */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="tech-frame divide-y" style={{ borderColor: 'var(--l-border)' }}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q} style={{ borderColor: 'var(--l-border)' }} className={i > 0 ? 'border-t' : ''}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="l-accordion-trigger"
            >
              <span className="text-left text-base font-medium sm:text-lg">{item.q}</span>
              <span className={`l-accordion-icon ${isOpen ? 'is-open' : ''}`} aria-hidden>+</span>
            </button>
            <div className={`l-accordion-panel ${isOpen ? 'is-open' : ''}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed sm:text-base" style={{ color: 'var(--l-muted)' }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
