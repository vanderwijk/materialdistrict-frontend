'use client'

interface ClientNewsletterFormProps {
  onSubmit: (email: string) => void
}

/**
 * Client variant van de newsletter form. Wordt alleen gebruikt wanneer de parent
 * een `onSubmit` callback aanlevert (typisch voor toast-feedback of in-page state).
 * De default Footer gebruikt een server-side form action.
 */
export function ClientNewsletterForm({ onSubmit }: ClientNewsletterFormProps) {
  return (
    <>
      <div className="footer-eyebrow">Newsletter — 2× per week</div>
      <form
        className="footer-newsletter"
        onSubmit={(e) => {
          e.preventDefault()
          const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)
            ?.value
          if (email) onSubmit(email)
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          required
          aria-label="Email address"
        />
        <button type="submit">Subscribe</button>
      </form>
      <div className="footer-newsletter-note">
        New materials, articles and events. No spam.
      </div>
    </>
  )
}
