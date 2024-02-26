import {Button, Card, Flex, Stack, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useEffect, useState} from "react";
import ModalActividades from "./ModalActividad/ModalActividad";
import {notifications} from '@mantine/notifications';
import {NombreActividad} from "../../../interfaces/dominio";


export default function ActividadInput() {
    const [opened, {open, close}] = useDisclosure(false);
    let [tituloModal, setTituloModal] = useState('');
    let [accionModal, setAccionModal] = useState('ADD');
    let [actividades, setActividades] = useState([] as NombreActividad[]);
    let [actividad, setActividad] = useState({nombre: ''} as NombreActividad);


    useEffect(() => {
        getActividades();
    }, [])

    const getActividades = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/actividades`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setActividades(data as NombreActividad[]);
            } else {
                notifications.show({
                    title: 'Error!',
                    message: data.msg,
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error!',
                message: 'No se pudo acceder a los productos disponibles, intente nuevamente.',
            })
        }
    }

    const items = actividades.map((actividad: NombreActividad, index: number) => {
        return <Card key={index}>
            <Flex justify={'space-between'} align={'center'}>
                <Text>{actividad.nombre}</Text>
                <Flex>
                    <Button variant="default" onClick={() => {
                        setAccionModal('EDIT');
                        setTituloModal('Editar Actividad');
                        setActividad(actividad)
                        open()
                    }}>Editar</Button>
                </Flex>

            </Flex>
        </Card>
    })


    return (
        <Stack maw={'600px'}>
            <ModalActividades
                actividades={actividades}
                setActividades={setActividades}
                opened={opened}
                onClose={close}
                titulo={tituloModal}
                accion={accionModal}
                actividad={actividad}
            ></ModalActividades>
            <Flex justify={'space-between'} align={'center'}>
                <span>Actividades</span>
                <Button color="rgba(116, 180, 155, 1)" onClick={() => {
                    setAccionModal('ADD');
                    setTituloModal('Agregar Actividad');
                    open()
                }}>Agregar Actividad</Button>
            </Flex>
            {actividades.length > 0 ? items :
                <Card key={0}> <Flex justify={'space-between'} align={'center'}> <Text>No hay actividades en el
                    sistema</Text> </Flex> </Card>}
        </Stack>
    )
}