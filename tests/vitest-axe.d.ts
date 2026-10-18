// Tipos do matcher `toHaveNoViolations` (registrado em vitest.setup.ts).
import 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
}
