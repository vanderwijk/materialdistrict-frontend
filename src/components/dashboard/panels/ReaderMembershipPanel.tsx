import Link from 'next/link'
import { INSIDER_PRICING } from '@/lib/config/membership'
import { InsiderMark } from '@/components/ui/InsiderMark'
import type { Membership } from '@/types/shared'

function fmtPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

const INSIDER_BENEFITS = [
  'Compare materials side by side',
  'Download datasheets, brochures & EPDs',
  'Request samples from manufacturers',
  'Save searches and get match alerts',
  'Organize materials in Boards',
  'Insider insights & quarterly trend reports',
]

/**
 * Reader Insider membership panel. Prices come from `membership.ts`
 * (INSIDER_PRICING) — never hardcoded. Active Insiders see their billing
 * status; free readers see the value proposition + the two billing options.
 */
export function ReaderMembershipPanel({ membership }: { membership: Membership }) {
  if (membership.isInsider) {
    const interval = membership.billingInterval === 'monthly' ? 'Monthly' : 'Annual'
    const renews = !membership.cancelAtPeriodEnd
    return (
      <div className="dash-panel">
        <h2 className="panel-section-title">
          <InsiderMark /> Your Insider membership
        </h2>
        <dl className="memb-status-grid">
          <div>
            <dt>Status</dt>
            <dd><span className="badge b-green">{membership.status}</span></dd>
          </div>
          <div>
            <dt>Billing</dt>
            <dd>{interval}</dd>
          </div>
          <div>
            <dt>{renews ? 'Renews on' : 'Access until'}</dt>
            <dd>{fmtDate(membership.validUntil)}</dd>
          </div>
        </dl>
        {membership.cancelAtPeriodEnd ? (
          <p className="field-helper">
            Your membership is set to cancel and will not renew. You keep Insider access until the date above.
          </p>
        ) : (
          <div className="memb-actions">
            <Link href="/dashboard/membership/manage" className="btn btn-outline">
              Manage billing
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Free reader — upgrade.
  const { monthly, annual } = INSIDER_PRICING
  return (
    <div className="dash-panel">
      <h2 className="panel-section-title">
        <InsiderMark /> Become an Insider
      </h2>
      <p className="panel-section-desc">
        Unlock the full MaterialDistrict toolkit for material research.
      </p>

      <ul className="benefit-list">
        {INSIDER_BENEFITS.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <div className="g2 plan-options">
        <div className="plan-option">
          <span className="plan-name">Annual</span>
          <span className="plan-price">{fmtPrice(annual.amount, annual.currency)}<small>/year</small></span>
          <span className="plan-note">Best value</span>
          <Link href="/checkout?plan=insider&interval=annual" className="btn btn-insider">Choose annual</Link>
        </div>
        <div className="plan-option">
          <span className="plan-name">Monthly</span>
          <span className="plan-price">{fmtPrice(monthly.amount, monthly.currency)}<small>/month</small></span>
          <span className="plan-note">Cancel anytime</span>
          <Link href="/checkout?plan=insider&interval=monthly" className="btn btn-outline">Choose monthly</Link>
        </div>
      </div>
    </div>
  )
}
