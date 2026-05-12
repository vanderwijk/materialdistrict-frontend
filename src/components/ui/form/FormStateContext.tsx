/**
 * FormStateContext — coordineert form-validatie tussen velden en submit-knop.
 *
 * Gebruik:
 *
 * ```tsx
 * <FormStateProvider>
 *   <Input label="Email" required />
 *   <Input label="Name" required />
 *   <SubmitButton>Save</SubmitButton>
 * </FormStateProvider>
 * ```
 *
 * Wat het doet:
 *   - Velden registreren zichzelf en hun huidige state (`valid`/`invalid`/`idle`).
 *   - SubmitButton checkt of er invalid velden zijn en zet `formError` zodra
 *     de gebruiker submit-poging heeft gedaan.
 *   - Bij submit-klik: roept `forceValidateAll()` op zodat alle nog-niet-aangeraakte
 *     required velden alsnog geëvalueerd worden.
 *   - Zodra alle velden valid zijn na een eerdere fout, gaat de submit-knop
 *     terug naar de normale variant.
 *
 * Optioneel — als de form-context ontbreekt, werken velden gewoon stand-alone:
 * geen submit-coordinatie, alleen lokale state. Dat houdt de componenten
 * bruikbaar buiten een Form-wrapper.
 */

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

interface FieldRegistration {
  forceValidate: () => void
  getState: () => 'idle' | 'valid' | 'invalid'
}

interface FormStateContextValue {
  /** Aanroepen door SubmitButton bij klik — forceert evaluatie van alle velden. */
  triggerSubmit: () => void
  /** True als triggerSubmit is aangeroepen én er invalid velden zijn. */
  hasFormError: boolean
  /** Field-componenten registreren zichzelf hier. Returnt unregister-fn. */
  registerField: (id: string, registration: FieldRegistration) => () => void
  /** Field-componenten melden hun state-veranderingen. */
  reportFieldState: (id: string, state: 'idle' | 'valid' | 'invalid') => void
}

const FormStateContext = createContext<FormStateContextValue | null>(null)

export function useFormState(): FormStateContextValue | null {
  return useContext(FormStateContext)
}

interface FormStateProviderProps {
  children: ReactNode
}

export function FormStateProvider({ children }: FormStateProviderProps) {
  const fieldsRef = useRef<Map<string, FieldRegistration>>(new Map())
  const [fieldStates, setFieldStates] = useState<
    Map<string, 'idle' | 'valid' | 'invalid'>
  >(new Map())
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const registerField = useCallback(
    (id: string, registration: FieldRegistration) => {
      fieldsRef.current.set(id, registration)
      return () => {
        fieldsRef.current.delete(id)
        setFieldStates((prev) => {
          if (!prev.has(id)) return prev
          const next = new Map(prev)
          next.delete(id)
          return next
        })
      }
    },
    [],
  )

  const reportFieldState = useCallback(
    (id: string, state: 'idle' | 'valid' | 'invalid') => {
      setFieldStates((prev) => {
        if (prev.get(id) === state) return prev
        const next = new Map(prev)
        next.set(id, state)
        return next
      })
    },
    [],
  )

  const triggerSubmit = useCallback(() => {
    fieldsRef.current.forEach((reg) => reg.forceValidate())
    setSubmitAttempted(true)
  }, [])

  // Bereken hasFormError: alleen na submit-poging, en alleen als er
  // ten minste één invalid is (of een idle required die net gedwongen werd).
  const hasFormError = useMemo(() => {
    if (!submitAttempted) return false
    for (const state of fieldStates.values()) {
      if (state === 'invalid') return true
    }
    return false
  }, [submitAttempted, fieldStates])

  // Reset submitAttempted zodra alle velden valid zijn — dan moet de
  // submit-knop terug naar de normale variant (gebruiker-keuze sessie 3A).
  useEffect(() => {
    if (!submitAttempted) return
    let allValidOrIdle = true
    for (const state of fieldStates.values()) {
      if (state === 'invalid') {
        allValidOrIdle = false
        break
      }
    }
    if (allValidOrIdle) {
      setSubmitAttempted(false)
    }
  }, [submitAttempted, fieldStates])

  const value = useMemo<FormStateContextValue>(
    () => ({
      triggerSubmit,
      hasFormError,
      registerField,
      reportFieldState,
    }),
    [triggerSubmit, hasFormError, registerField, reportFieldState],
  )

  return (
    <FormStateContext.Provider value={value}>
      {children}
    </FormStateContext.Provider>
  )
}
