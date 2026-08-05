'use client'

/**
 * GptLoader — loads GPT as soon as the shell mounts.
 *
 * Ad Manager Privacy & messaging (EU consent CMP) only appears when gpt.js
 * is on the page. Waiting for an AdSlot to hydrate is too late and leaves
 * visitors on a custom cookie bar with no TCF signal. Ads still wait for
 * consent via disableInitialLoad + refresh in AdSlot.
 */

import { useEffect } from 'react'

const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
const GPT_SCRIPT_ID = 'gpt-js'

export function GptLoader() {
  useEffect(() => {
    const win = window as unknown as {
      googletag?: { cmd: Array<() => void> }
    }
    win.googletag = win.googletag ?? { cmd: [] }
    if (!Array.isArray(win.googletag.cmd)) win.googletag.cmd = []

    if (document.getElementById(GPT_SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = GPT_SCRIPT_ID
    script.src = GPT_SRC
    script.async = true
    document.head.appendChild(script)
  }, [])

  return null
}
