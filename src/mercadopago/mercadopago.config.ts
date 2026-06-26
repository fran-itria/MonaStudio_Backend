import { MercadoPagoConfig, Preference } from "mercadopago";

console.log('Access token: ', process.env.ACCESS_TOKEN_SANDBOX);
const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN_SANDBOX! });
export const preference = new Preference(client)