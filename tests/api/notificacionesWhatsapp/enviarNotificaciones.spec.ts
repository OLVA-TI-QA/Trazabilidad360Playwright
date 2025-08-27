import { test, expect } from '@playwright/test'
import { exportarResultadosGenerico, leerDatosDesdeExcel } from '../../../src/utils/helpers'
import { validarDatosExcel } from '@/utils/validadores'
import { Olvaexpress } from '@/apiProviders/olvaexpress'
import { ExcelValidacionExportNotificaciones } from '@/types/excelInterfaces'

// Interfaz para tipado de las filas del Excel
interface FilaExcelNotificacion {
  CELULAR: string
  IDGESTION: number
  TIPO: number
  VALORESPERADO: string
}

test.describe('Pruebas de API WhatsApp - Requests Paralelos Simulando Concurrencia', () => {
  let olvaexpress: Olvaexpress

  // Ruta y nombre de la hoja de Excel
  const excelPath = './src/testData/archivosExcel/TestCasesNotificacionesParalelo.xlsx'
  const sheetName = 'Test6'

  // Número de requests simultáneos por cada caso de prueba
  const REQUESTS_POR_CASO = 3

  // Setup antes de cada test
  test.beforeEach(async () => {
    const currentOlvaexpress = new Olvaexpress()
    olvaexpress = await currentOlvaexpress.init()
  })

  // Test principal simulando concurrencia de requests
  test('Simular 3 requests paralelos por caso y validar que solo uno sea exitoso', async () => {
    // Aumenta el tiempo de espera a 120 segundos debido a la concurrencia
    test.setTimeout(120000)

    console.log('🚀 Iniciando prueba de concurrencia de requests')

    // Paso 1: Leer Excel
    const datos = leerDatosDesdeExcel(excelPath, sheetName)
    // Validar que el archivo de datos existe y tiene datos
    validarDatosExcel(datos, sheetName)

    console.log(`📊 Se procesarán ${datos.length} casos de prueba, cada uno con ${REQUESTS_POR_CASO} requests paralelos`)

    const resultadosValidacion: ExcelValidacionExportNotificaciones[] = []

    // Iterar cada fila del Excel
    for (let i = 0; i < datos.length; i++) {
      const fila = datos[i] as FilaExcelNotificacion

      // Extraer datos de la fila
      const celular = fila['CELULAR']
      const id_gestion = fila['IDGESTION']
      const tipo = fila['TIPO']
      const valorEsperado = String(fila['VALORESPERADO']).toLowerCase()

      console.log(`\n--- Caso ${i + 1}/${datos.length}: ID_GESTION ${id_gestion} ---`)
      console.log(`Enviando ${REQUESTS_POR_CASO} requests paralelos al mismo tiempo...`)

      // Capturar el momento exacto de ejecución
      const tiempoEjecucion = new Date()
      const horaCompleta = `${tiempoEjecucion.getHours().toString().padStart(2, '0')}:${tiempoEjecucion.getMinutes().toString().padStart(2, '0')}:${tiempoEjecucion.getSeconds().toString().padStart(2, '0')}`

      console.log(`⏰ Tiempo de ejecución: ${horaCompleta}`)

      // Crear array de promesas para enviar los 3 requests exactamente al mismo tiempo
      const requestPromises = Array.from({ length: REQUESTS_POR_CASO }, async (_, requestIndex) => {
        try {
          const response = await olvaexpress.postSendWhatsapp(celular, id_gestion, tipo)
          const body = await response.json()

          return {
            requestNumber: requestIndex + 1,
            status: response.status(),
            error: body.error,
            body: body,
            success: true
          }
        } catch (error) {
          console.error(`❌ Error en request ${requestIndex + 1}:`, error)
          return {
            requestNumber: requestIndex + 1,
            status: 0,
            error: true,
            body: { error: true, message: 'Request failed' },
            success: false
          }
        }
      })

      // Ejecutar todos los requests al mismo tiempo y esperar todas las respuestas
      const respuestasParalelas = await Promise.all(requestPromises)

      console.log('📋 Resultados de los requests paralelos:')
      respuestasParalelas.forEach((resp, idx) => {
        console.log(`   Hilo ${idx + 1}: Status ${resp.status}, Error: ${resp.error}`)
      })

      // Validar que solo uno de los requests fue exitoso (error: false, status: 200)
      const requestsExitosos = respuestasParalelas.filter(resp =>
        resp.status === 200 && resp.error === false
      )
      const requestsAnulados = respuestasParalelas.filter(resp =>
        resp.status === 200 && resp.error === true
      )

      // Determinar el valor esperado
      let errorEsperado: boolean
      switch (valorEsperado) {
        case 'true':
        case 'verdadero':
          errorEsperado = true
          break
        case 'false':
        case 'falso':
          errorEsperado = false
          break
        default:
          errorEsperado = false
          console.error(`⚠️ Valor inesperado en VALORESPERADO para ID_GESTION ${id_gestion}: ${valorEsperado}`)
          break
      }

      // Validar la lógica de concurrencia: debe haber exactamente 1 exitoso y 2 anulados
      // SOLO si se esperaba que fuera exitoso (error: false)
      const validacionConcurrencia = errorEsperado ?
        // Si se esperaba error, todos deben tener error
        requestsAnulados.length === REQUESTS_POR_CASO && requestsExitosos.length === 0 :
        // Si se esperaba éxito, debe haber exactamente 1 exitoso y 2 anulados
        requestsExitosos.length === 1 && requestsAnulados.length === 2

      console.log(`🔍 Validación:`)
      console.log(`   - Requests exitosos (error: false): ${requestsExitosos.length}`)
      console.log(`   - Requests anulados (error: true): ${requestsAnulados.length}`)
      console.log(`   - ¿Ejecución válida?: ${validacionConcurrencia ? '✅ Sí' : '❌ No'}`)

      // Agregar cada request al resultado para exportar
      respuestasParalelas.forEach((resp) => {
        const esElEnviado = !errorEsperado && resp.error === false && resp.status === 200

        resultadosValidacion.push({
          celular: celular,
          idGestion: id_gestion,
          tipo: tipo,
          valorEsperado: errorEsperado,
          valorObtenido: resp.error,
          correcto: validacionConcurrencia, // La validación es por grupo, no individual
          statusEsperado: '200',
          statusObtenido: resp.status.toString(),
          mensajeErrorObtenido: resp.body.message || '',
          horaEjecucion: horaCompleta,
          numeroRequest: resp.requestNumber,
          enviado: esElEnviado
        })
      })

      // Validar que la concurrencia funcionó correctamente
      if (!validacionConcurrencia) {
        console.error(`❌ Fallo en validación de concurrencia para ID_GESTION ${id_gestion}`)
        if (!errorEsperado) {
          console.error(`   Se esperaba: 1 exitoso, 2 anulados. Se obtuvo: ${requestsExitosos.length} exitosos, ${requestsAnulados.length} anulados`)
        } else {
          console.error(`   Se esperaba: 0 exitosos, 3 anulados. Se obtuvo: ${requestsExitosos.length} exitosos, ${requestsAnulados.length} anulados`)
        }
      } else {
        console.log(`✅ Caso ${i + 1} validado correctamente`)
      }
    }

    // Generar estadísticas finales
    const totalCasos = datos.length
    const casosValidados = resultadosValidacion.filter(r => r.correcto).length / REQUESTS_POR_CASO
    const requestsExitososTotal = resultadosValidacion.filter(r => r.enviado === true).length
    const requestsAnuladosTotal = resultadosValidacion.filter(r => r.valorObtenido === true).length

    console.log('\n📊 RESUMEN FINAL:')
    console.log(`- Total de casos procesados: ${totalCasos}`)
    console.log(`- Casos que pasaron validación de concurrencia: ${casosValidados}/${totalCasos}`)
    console.log(`- Total de requests exitosos: ${requestsExitososTotal}`)
    console.log(`- Total de requests anulados: ${requestsAnuladosTotal}`)
    console.log(`- Total de requests enviados: ${resultadosValidacion.length}`)

    // Exportar resultados a Excel
    exportarResultadosGenerico<ExcelValidacionExportNotificaciones>({
      data: resultadosValidacion,
      nombreBase: 'resultados_notificaciones_whatsapp',
      headers: [
        'CELULAR',
        'ID GESTION',
        'TIPO',
        'RESULTADO ESPERADO',
        'RESULTADO OBTENIDO',
        'ES CORRECTO?',
        'STATUS ESPERADO',
        'STATUS OBTENIDO',
        'MENSAJE ERROR',
        'HORA',
        'NUM REQUEST',
        'SE ENVIÓ?'
      ],
      extraerCampos: [
        (r) => r.celular,
        (r) => r.idGestion,
        (r) => r.tipo,
        (r) => (r.valorEsperado ? 'true' : 'false'),
        (r) => (r.valorObtenido ? 'true' : 'false'),
        (r) => (r.correcto ? 'Sí' : 'No'),
        (r) => r.statusEsperado || '',
        (r) => r.statusObtenido || '',
        (r) => r.mensajeErrorObtenido || '',
        (r) => r.horaEjecucion || '',
        (r) => r.numeroRequest || 0,
        (r) => r.enviado ? 'Sí' : 'No'
      ]
    })

    // Validaciones finales con expect
    expect(casosValidados).toBeGreaterThan(0) // Al menos un caso debe pasar la validación

    // Si hay casos que esperaban éxito, debe haber exactamente 1 request exitoso por cada caso
    const casosQueEsperabanExito = (datos as FilaExcelNotificacion[]).filter(d => String(d['VALORESPERADO']).toLowerCase() === 'false').length
    if (casosQueEsperabanExito > 0) {
      expect(requestsExitososTotal).toBe(casosQueEsperabanExito)
    }
  })
})
