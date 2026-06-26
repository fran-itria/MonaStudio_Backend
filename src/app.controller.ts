import { Body, Controller, Get, Headers, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import MercadoPagoConfig, { Preference } from 'mercadopago';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/payment-methods')
  async getPaymentMethods(@Res() res: Response): Promise<void> {
    try {
      const data = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN_SANDBOX}`,
          'Content-Type': 'application/json'
        }
      });
      const methods = await data.json();
      res.status(200).json({
        message: 'Payment methods retrieved successfully',
        data: methods
      })
    } catch (error) {
      console.error('Error retrieving payment methods');
    }
  }


  @Post('/create-preference')
  async createPreference(@Body() body: any, @Res() res: Response): Promise<void> {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN_SANDBOX! });
      const preference = new Preference(client)
      const newPreference = await preference.create({
        body: {
          items: [
            {
              id: "1234",
              title: "Mi producto",
              quantity: 1,
              unit_price: 5000
            }
          ],
          // notification_url: "(url_produccion || url_publica_temporal_ngrok)/api/v1/webhook/mercadopago", 
          external_reference: "03a5250a-2a1e-4c23-b09a-b1e866b4fc43"
        },
      })
      res.status(200).json({
        mensaje: "Preferencia creada con éxito",
        preference: {
          id: newPreference.id,
          additional_info: newPreference.additional_info,
          external_reference: newPreference.external_reference,
          init_point: newPreference.init_point,
          notification_url: newPreference.notification_url,
          items: newPreference.items
        }
      })
    } catch (error) {
      console.error('Error creating preference:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @Post('/webhook/mercadopago')
  async webhookMercadoPago(
    @Body() body: any,
    @Headers() headers: any,
    @Res() res: Response): Promise<void> {
    try {
      const isPayment = body?.type == "payment" || body?.topic == "payment"
      if (!isPayment) {
        res.status(200).send('OK');
        return
      };
      res.status(200).send('OK');

      const paymentId = body?.data?.id ?? body?.resource
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN_SANDBOX}`,
          'Content-Type': 'application/json'
        }
      });
      const paymentData = await response.json();
      // 1. Recibo webhook.

      // 2. Verifico que sea un evento de payment.
      //    Si no lo es:
      //       responder 200 y terminar.

      // 3. Crear registro en tabla Webhooks:
      //       - paymentId
      //       - status = PENDING
      //       - retryCount = 0
      //       - lastError = null
      //       - receivedAt = now()

      // 4. Responder 200 a Mercado Pago.

      // 5. Iniciar procesamiento.

      // 6. Obtener Payment desde Mercado Pago.

      // 7. Buscar mi orden mediante external_reference.

      // 8. Comparar estado del Payment con el estado de mi orden.

      // 9. Si los estados coinciden:
      //       webhook.status = COMPLETED
      //       processedAt = now()
      //       return

      // 10. Si los estados no coinciden:
      //       intentar actualizar la orden.

      // 11. Si la actualización fue exitosa:
      //       webhook.status = COMPLETED
      //       processedAt = now()
      //       return

      // 12. Si la actualización falla:
      //       webhook.status = PENDING
      //       retryCount++
      //       lastError = error
      //       return

      // 13. Cron cada X minutos.

      // 14. Buscar todos los Webhooks con status = PENDING.

      // 15. Para cada uno:
      //       Obtener Payment.
      //       Obtener Orden.
      //       Comparar estados.

      // 16. Si coinciden:
      //       webhook.status = COMPLETED

      // 17. Si no coinciden:
      //       intentar actualizar la orden.

      // 18. Si actualiza correctamente:
      //       webhook.status = COMPLETED

      // 19. Si vuelve a fallar:
      //       retryCount++
      //       lastError = error
      //       updatedAt = now()

      // 20. Fin.
    } catch (error) {
      console.error('Error processing webhook from MercadoPago:', error);
      res.status(500).send('Internal Server Error');
      return
    }
  }
}
