import { Documento } from "../../../interfaces/dominio";

export default function convertiraBase64(archivo: Documento): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
            const base64 = reader.result;
            if (typeof base64 === 'string') {
                const arrAuxiliar = base64.split(",");
                resolve(arrAuxiliar[1]);
            } else {
                reject(new Error("No se pudo leer el archivo como base64."));
            }
        };

        reader.onerror = function () {
            reject(new Error("Error al leer el archivo."));
        };

        reader.readAsDataURL(archivo);
    });
}