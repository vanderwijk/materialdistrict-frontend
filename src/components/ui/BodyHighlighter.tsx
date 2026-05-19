'use client'

/**
 * BodyHighlighter
 * ----------------------------------------------------------------------
 * Pakt een container-DOM-node en wrapt text-node-matches van een
 * zoek-term in <mark>-tags. Werkt veilig op HTML die via
 * `dangerouslySetInnerHTML` is binnengeladen omdat we alleen text-nodes
 * aanpassen — geen HTML-parsing of structuur-wijziging.
 *
 * Gebruik:
 *   <div ref={containerRef} dangerouslySetInnerHTML={...} />
 *   <BodyHighlighter targetRef={containerRef} term="..." />
 *
 * Of, voor `useSearchParams()`-gebruik op de detail-page, wikkel deze
 * in een wrapper-component die de term uit de URL leest.
 */

import { useEffect, type RefObject } from 'react'
import { useSearchParams } from 'next/navigation'

const MARK_CLASS = 'search-mark'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildPattern(term: string): RegExp | null {
  const words = term.trim().split(/\s+/).filter(Boolean).map(escapeRegex)
  if (words.length === 0) return null
  return new RegExp(`(${words.join('|')})`, 'gi')
}

/**
 * Walk DOM en wrap matches binnen text-nodes in <mark>-tags.
 * Slaat <script>, <style> en al-gemarkeerde nodes over.
 */
function highlightDom(root: HTMLElement, pattern: RegExp): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      const tag = parent.tagName
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let current = walker.nextNode()
  while (current) {
    textNodes.push(current as Text)
    current = walker.nextNode()
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? ''
    if (!text || !pattern.test(text)) continue
    pattern.lastIndex = 0

    const frag = document.createDocumentFragment()
    let lastIndex = 0
    let m: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)

    while ((m = regex.exec(text)) !== null) {
      const matchStart = m.index
      const matchEnd = matchStart + m[0].length
      if (matchStart > lastIndex) {
        frag.appendChild(
          document.createTextNode(text.slice(lastIndex, matchStart)),
        )
      }
      const markEl = document.createElement('mark')
      markEl.className = MARK_CLASS
      markEl.textContent = m[0]
      frag.appendChild(markEl)
      lastIndex = matchEnd
      // Voorkom infinite-loop op zero-width matches
      if (m.index === regex.lastIndex) regex.lastIndex++
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)))
    }

    textNode.parentNode?.replaceChild(frag, textNode)
  }
}

function unhighlightDom(root: HTMLElement): void {
  const marks = root.querySelectorAll(`mark.${MARK_CLASS}`)
  marks.forEach((m) => {
    const text = m.textContent ?? ''
    m.parentNode?.replaceChild(document.createTextNode(text), m)
  })
  root.normalize()
}

export interface BodyHighlighterProps {
  targetRef: RefObject<HTMLElement | null>
}

/**
 * Leest `?q=` uit de URL en past highlighting toe op de gerefereerde
 * container. Reset eerst bestaande highlights bij elke term-wijziging.
 */
export function BodyHighlighter({ targetRef }: BodyHighlighterProps) {
  const sp = useSearchParams()
  const term = sp.get('q') ?? ''

  useEffect(() => {
    const root = targetRef.current
    if (!root) return

    // Reset eerst eventuele bestaande highlights
    unhighlightDom(root)

    const pattern = buildPattern(term)
    if (!pattern) return

    highlightDom(root, pattern)

    return () => {
      // Cleanup bij unmount of term-change
      if (root) unhighlightDom(root)
    }
  }, [term, targetRef])

  return null
}
