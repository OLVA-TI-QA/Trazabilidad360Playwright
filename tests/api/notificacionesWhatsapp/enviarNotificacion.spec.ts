import { test, expect } from '@playwright/test'
import { Olvaexpress } from '@/apiProviders/olvaexpress'

let olvaexpress: Olvaexpress

// Setup de provider before all test
test.beforeEach(async () => {
  const currentOlvaexpress = new Olvaexpress()
  olvaexpress = await currentOlvaexpress.init()
})

test('Enviar una notificación por Whatsapp', async () => {
  // Paso 1: Login para obtener el token

  const sendWhatsappResponse = await olvaexpress.postSendWhatsapp('926208479', 160864065, 7)

  console.log(`Status: ${sendWhatsappResponse.status()}`)
  expect(sendWhatsappResponse.status()).toBe(200)

  const sendWhatsappBodyResponse = await sendWhatsappResponse.json()
  expect('error' in sendWhatsappBodyResponse).toBe(true)

  const error = sendWhatsappBodyResponse.error
  expect(error).toBe(false)

  console.log('El mensaje se envió correctamente para el número 926208479')
})
