import { Stack, Title } from "@mantine/core";
import NotificacionPersonalInput from "./NotificacionPersonal/NotificacionPersonalInput";
import NotificacionActividadInput from "./NotificacionActividad/NotificacionActividadInput";
import CamposInput from "./CamposInput/CamposInput";
import ProductosInput from "./ProductosInput/ProductosInput";
import ActividadInput from "./ActividadInput/ActividadInput";
import '../../App.scss'
import { useState } from "react";
import CustomLoader from "../Global/Loader/CustomLoader";

export default function SettingsView() {
    const [loading, setLoading] = useState(false);
    return (
        <CustomLoader isLoading={loading}>
            <Stack
                bg={"#D9D9D9"}
                mih={"100vh"}
                py={'xl'}
                px={'xl'}
                w={'100%'}
            >
                <Title mb="xl" order={1}>Ajustes</Title>
                <Title order={2}>Notificaciones</Title>
                <NotificacionPersonalInput />
                <NotificacionActividadInput />
                <Title order={2}>Campos</Title>
                <CamposInput />
                <Title order={2}>Productos</Title>
                <ProductosInput />
                <Title order={2}>Actividades</Title>
                <ActividadInput />
            </Stack>
        </CustomLoader>
    );
}
