import { expect } from '@playwright/test'

/**
 * Valida que una lista de datos leída desde un archivo Excel no esté vacía.
 */
export function validarDatosExcel(datos: any[], sheetName: string) {
  expect(datos).not.toBeNull()
  expect(Array.isArray(datos)).toBe(true)
  expect(datos.length).toBeGreaterThan(0)

  console.log(`✅ Excel '${sheetName}' tiene ${datos.length} registros.`)
}

export function procesarValorCeldaExcel(valorCelda: any): string | number | null {
  // Regla 1: Si el valor es el string literal 'null'
  if (valorCelda === 'null') return null;

  // Regla 2: Si la celda está vacía (la librería devuelve null o undefined)
  if (valorCelda === null || valorCelda === undefined) return '';

  // Regla 3: Para todo lo demás, devuelve el valor tal cual
  return valorCelda;
}
