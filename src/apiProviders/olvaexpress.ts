import { request, APIRequestContext } from '@playwright/test'
import { environment } from '../config/environment'

export class Olvaexpress {
  private baseUrl?: APIRequestContext

  async init() {
    this.baseUrl = await request.newContext({
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': environment.xApiKey
      },
      baseURL: environment.apiBaseUrlOlvaexpressDev
    })

    return this
  }

  public async postSendWhatsapp(celular: string, id_gestion: number, tipo: number) {
    const sendwhatsappResponse = await this.baseUrl!.post('/mobile/whatsapp/send', {
      data: {
        celular,
        id_gestion,
        tipo
      }
    })

    return sendwhatsappResponse
  }
}
