

export class VarityErrors {
    static readonly NOT_NAME_PROPERTY = { message: "El nombre es obligatorio para crear variedad", errorCode: "NOT_NAME_PROPERTY" }
    static readonly NOT_FOUND_VARITIES = { message: "No se encontraron variedades registradas", errorCode: "NOT_FOUND_VARITIES" }
    static readonly NOT_FOUND_VARITY = { message: "Alguna de las variedades elegidas no se encuentra", errorCode: "NOT_FOUND_VARITY" }
    static readonly INSUFICIENT_STOCK = (varity: string) => ({ message: `Stock de ${varity.toLocaleUpperCase()} insuficiente para completar la orden`, errorCode: "INSUFICIENT_STOCK" })
}