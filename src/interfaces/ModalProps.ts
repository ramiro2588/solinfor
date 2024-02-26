import {NombreActividad} from "./dominio";
import {Dispatch, SetStateAction} from "react";

export default interface ModalProps {
    opened: boolean;
    onClose: () => void;
    titulo: string;
    accion: string;
    actividad?: NombreActividad;
    setActividades: Dispatch<SetStateAction<NombreActividad[]>>;
    actividades: NombreActividad[];
}