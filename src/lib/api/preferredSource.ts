/**
 * Preferred Sources — click-logging (client-side, best-effort)
 * ----------------------------------------------------------------------
 * Logt een klik op de "Make MaterialDistrict your preferred source"-knop als
 * generiek event via de gedeelde eventlaag (`logEvent`). Anoniem-veilig: geen
 * login vereist.
 */

import { logEvent } from './events'

export function logPreferredSourceClick(placement: string): void {
  void logEvent({
    eventType: 'preferred_source_click',
    objectType: 'site',
    objectId: 'materialdistrict.com',
    source: placement,
  })
}
