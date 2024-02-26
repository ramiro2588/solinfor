import {saveAs} from "file-saver";

export interface Actividad {
    nombre: string;
}

export interface Rol {
    nombre: string;
}

export interface Campo {
    id: number;
    nombre: string;
}

export interface Personal {
    id: number;
    nombre: string;
    fechaDeNacimiento: string;
    fechaDeIngreso: string;
    cedula: string;
    telefonoContacto: string;
    eliminado: boolean;
    documentos: Documento[]
}

export interface Producto {
    id: number;
    img: string;
    marca?: string;
    nombre: string;
    tipo: string;
}

export interface Unidad {
    id: number;
    tipo: string;
    nombre: string;
    state: boolean;
}

export interface ValoresProducto {
    cantidad: string;
    unidad: string;
}

export interface NombreActividad {
    id: number;
    nombre: string;
}

export interface NombreProducto {
    id: number;
    nombre: string;
}

export interface ActividadValidaciones {
    nombreActividad: NombreActividad;
    validaciones: ValidacionProducto[];
}

export interface ValidacionProducto {
    idNombreActividad: number;
    idProducto: number;
    litrosOptimos: number;
    litrosMaximos: number;
    litrosMinimos: number;
}

export interface Documento extends File {
    id?: number,
    fechaDeSubida?: string;
    validez: string;
    docNombre: string;
    content?: Buffer;
    idPersonal: number;
}

export interface FileToUpload {
    name: string,
    file: File,
    fechaDeVencimiento: string,
}

export namespace DocumentoFunctions {
    export async function downloadDocumento(archivo: Documento) {
        const uint8ArrayData = new Uint8Array((archivo.content as any).data);
        const blobData = new Blob([uint8ArrayData], {type: archivo.type});
        saveAs(blobData, archivo.docNombre);
    }

    export async function downloadFileToUpload(archivo: FileToUpload) {
        const blobData = new Blob([archivo.file], {type: archivo.file.type});
        saveAs(blobData, archivo.file.name);
    }
}

export interface Stock {
    campo: number;
    producto: number;
    campo_nombre: string;
    producto_nombre: string;
    producto_marca: string;
    producto_tipo: string;
    cantidad: number;
}

export interface Usuario {
    id: number;
    username: string;
    email: string;
    password: string;
    role: number;
    active: number;
    name: string;
}

export interface Audit {
    id: number,
    producto: string,
    campo: string,
    fecha: string,
    cantidad: number,
    unidad: string,
    tipo: string,
    actividad: string
}

export enum Permiso {
    LEER_USUARIOS = "LEER_USUARIOS",
    CREAR_USUARIOS = "CREAR_USUARIOS",
    DAR_BAJA_USUARIOS = "DAR_BAJA_USUARIOS",
    EDITAR_USUARIO = "EDITAR_USUARIO",
    LEER_ACTIVIDAD = "LEER_ACTIVIDAD",
    AGREGAR_ACTIVIDAD = "AGREGAR_ACTIVIDAD",
    EDITAR_ACTIVIDAD = "EDITAR_ACTIVIDAD",
    LEER_PRODUCTOS = "LEER_PRODUCTOS",
    AGREGAR_PRODUCTO = "AGREGAR_PRODUCTO",
    LEER_PERSONAL = "LEER_PERSONAL",
    AGREGAR_PERSONAL = "AGREGAR_PERSONAL",
    EDITAR_PERSONAL = "EDITAR_PERSONAL",
    EDITAR_AJUSTES = "EDITAR_AJUSTES",
}