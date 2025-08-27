export interface ExportConfig<T> {
  data: T[]
  nombreBase: string
  headers: string[]
  nombreHoja?: string
  extraerCampos: CampoExtractor<T>[]
}

export type CampoExtractor<T> = (item: T) => string | number | boolean | undefined

// Interfaz para el Excel, adaptada a la función exportarResultadosGenerico

export interface ExcelValidacionExportNotificaciones {
  celular: string
  idGestion: number
  tipo: number
  valorEsperado: boolean
  valorObtenido: boolean
  correcto: boolean
  statusEsperado?: string
  statusObtenido?: string
  mensajeErrorObtenido?: string
}
