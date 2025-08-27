import { test, expect } from '@playwright/test'
import { exportarResultadosGenerico, leerDatosDesdeExcel } from '../../../src/utils/helpers'
import { validarDatosExcel } from '@/utils/validadores'
import { Olvaexpress } from '@/apiProviders/olvaexpress'
import { ExcelValidacionExportNotificaciones } from '@/types/excelInterfaces'

test.describe('Pruebas de la API de WhatsApp con Excel', () => {
  let olvaexpress: Olvaexpress

  // Ruta y nombre de la hoja de Excel
  const excelPath = './src/testData/archivosExcel/TestCasesNotificacionesParalelo.xlsx'
  const sheetName = 'Test4'

  // Define el tamaño de cada lote de peticiones
  const BATCH_SIZE = 40

  // Setup antes de cada test
  test.beforeEach(async () => {
    const currentOlvaexpress = new Olvaexpress()
    olvaexpress = await currentOlvaexpress.init()
  })

  // Test principal con múltiples envíos
  test('Enviar peticiones y validar respuestas correctas', async () => {
    // Aumenta el tiempo de espera a 80 segundos (80000ms)
    test.setTimeout(80000)

    // Paso 1: Leer Excel
    const datos = leerDatosDesdeExcel(excelPath, sheetName)
    // Validar que el archivo de datos existe y tiene datos
    validarDatosExcel(datos, sheetName)

    const resultadosValidacion: ExcelValidacionExportNotificaciones[] = []

    // 2. Iterar los datos en lotes para procesar peticiones con concurrencia limitada
    for (let i = 0; i < datos.length; i += BATCH_SIZE) {
      const batch = datos.slice(i, i + BATCH_SIZE)
      console.log(
        `\n--- Procesando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(datos.length / BATCH_SIZE)} (${batch.length} elementos) ---`
      )

      // 2. Mapear los datos a un array de promesas de peticiones API
      const requestsToSendForBatch = batch.map(async (fila: any) => {
        // Ajusta los nombres de las columnas a como estén en tu Excel
        const celular = fila['CELULAR'] // Asume que el Excel tiene una columna 'celular'
        const id_gestion = fila['IDGESTION'] // Asume que el Excel tiene una columna 'id_gestion'
        const tipo = fila['TIPO'] // Asume que el Excel tiene una columna 'tipo'
        const valorEsperado = String(fila['VALORESPERADO']).toLowerCase() // Asume que el Excel tiene una columna 'tipo'

        console.log(`Preparando solicitud para id_gestion: ${id_gestion}, tipo: ${tipo}`)

        const response = await olvaexpress.postSendWhatsapp(celular, id_gestion, tipo)

        // Retornamos la respuesta y la fila original para la validación
        return { response, fila, valorEsperado }
      })

      // Ejecutar todas las promesas del lote en paralelo y esperar a que terminen
      const responsesInBatch = await Promise.all(requestsToSendForBatch)

      // 3. Procesar y validar cada respuesta del lote
      for (const { response, fila, valorEsperado } of responsesInBatch) {
        const body = await response.json()

        // La lógica de validación ahora es más explícita y segura
        let errorEsperado: boolean

        // Uso de switch case para la conversión
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
            // Si el valor no es uno de los esperados, asumimos un caso de error
            errorEsperado = false
            console.error(
              `Advertencia: Valor inesperado en la columna 'VALORESPERADO' para la fila con ID Gestión ${fila['IDGESTION']}: ${valorEsperado}`
            )
            break
        }

        const errorObtenido = body.error

        // Validamos si la respuesta de la API es la esperada
        const esCorrecto = errorObtenido === errorEsperado

        resultadosValidacion.push({
          celular: fila['CELULAR'],
          idGestion: fila['IDGESTION'],
          tipo: fila['TIPO'],
          valorEsperado: errorEsperado,
          valorObtenido: errorObtenido,
          correcto: esCorrecto
        })

        console.log(`✅ Fila procesada: ID GESTIÓN ${fila['IDGESTION']} - Resultado: ${esCorrecto ? 'Correcto' : 'Incorrecto'}`)
      }
    } // Fin del bucle de lotes

    // 4. Generar el resumen y exportar a Excel
    const totalRegistros = resultadosValidacion.length
    const mensajesEnviados = resultadosValidacion.filter((item) => !item.valorObtenido).length
    const mensajesNoEnviados = totalRegistros - mensajesEnviados
    const mensajesEnviadosExcel = resultadosValidacion.filter((item) => !item.valorEsperado).length
    const mensajesNoEnviadosExcel = totalRegistros - mensajesEnviadosExcel

    console.log('---')
    console.log(`📊 Resumen de la prueba:`)
    console.log(`- ${totalRegistros} registros procesados.`)
    console.log(`- ${mensajesEnviados} mensajes enviados correctamente (error: false).`)
    console.log(`- ${mensajesNoEnviados} mensajes con error de envío (error: true).`)
    console.log('---')

    exportarResultadosGenerico<ExcelValidacionExportNotificaciones>({
      data: resultadosValidacion,
      nombreBase: 'resultados_notificaciones_whatsapp',
      headers: ['CELULAR', 'ID GESTION', 'TIPO', 'RESULTADO ESPERADO', 'RESULTADO OBTENIDO', 'ES CORRECTO?'],
      extraerCampos: [
        (r) => r.celular,
        (r) => r.idGestion,
        (r) => r.tipo,
        (r) => (r.valorEsperado ? 'true' : 'false'),
        (r) => (r.valorObtenido ? 'true' : 'false'),
        (r) => (r.correcto ? 'Sí' : 'No')
      ]
    })

    expect(mensajesEnviados).toBe(mensajesEnviadosExcel) // Validación de la cantidad de mensajes enviados comparados entre los esperados y obtenidos
    expect(mensajesNoEnviados).toBe(mensajesNoEnviadosExcel) // Validación de la cantidad de mensajes no enviados comparados entre los esperados y obtenidos
  })
})
