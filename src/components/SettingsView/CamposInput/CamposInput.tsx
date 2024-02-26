import {Button, Flex, InputBase, LoadingOverlay, Pill, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {notifications} from '@mantine/notifications';
import {Campo} from "../../../interfaces/dominio";

export default function CamposInput() {
    let [campos, setCampos] = useState([] as Campo[]);
    const errorMessages = {
        campo: {
            empty: "El campo no puede estar vacío",
            yaExiste: "El campo ingresado ya existe"
        }
    }

    async function getCampos() {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/campo`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setCampos(data as Campo[]);
            } else {
                notifications.show({
                    title: 'Error!',
                    message: data.msg,
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error!',
                message: 'No se pudo acceder a los campos disponibles, intente nuevamente.',
            })
        }
    }

    useEffect(() => {
        getCampos();
    }, [])

    const onSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        campoForm.validate();
        if (!campoForm.isValid()) {
            return
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/campo`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: campoForm.values.campo
                })
            });
            let data = await response.json();
            if (response.status == 200) {
                setCampos((data[0] as Campo[]));
                notifications.show({
                    color: 'green',
                    title: 'El campo se agregó correctamente!',
                    message: ''
                })
                campoForm.setFieldValue('campo', '')
            } else {
                notifications.show({
                    color: 'red',
                    title: 'Error!',
                    message: data.msg,
                })
            }
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Error!',
                message: 'Error, intente nuevamente.',
            })
        }

    }

    const onRemove = (id: number) => {
        return async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/campo`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: id
                    })
                });
                let data = await response.json();
                if (response.status == 200) {
                    setCampos(campos.filter(x => x.id != id));
                    notifications.show({
                        color: 'green',
                        title: 'El campo se eliminó correctamente!',
                        message: ''
                    })
                } else {
                    notifications.show({
                        color: 'red',
                        title: 'Error!',
                        message: data.msg,
                    })
                }
            } catch (error) {
                notifications.show({
                    color: 'red',
                    title: 'Error!',
                    message: 'intente nuevamente.',
                })
            }
        }
    }

    const campoForm = useForm({
        initialValues: {
            campo: ''
        },
        validate:{
            campo: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.campo.empty;
                }
                if(!campoForm.values.campo || campos.some(x => x.nombre?.toLocaleLowerCase() == campoForm.values.campo.toLocaleLowerCase())){
                    return errorMessages.campo.yaExiste;
                }
                return null;
            }
        }
    });

    const items = campos.map(campo => {
        return (<Pill key={campo.id} bg={'rgba(116, 180, 155, 1)'} c={'white'} withRemoveButton
                      onRemove={onRemove(campo.id)}>
            {campo.nombre}
        </Pill>)
    })

    return (
        <Stack my={'20px'}>
            <form onSubmit={onSubmit}>
                <Flex
                    align={"flex-end"}
                >
                    <TextInput
                        autoComplete="none"
                        label="Campo"
                        onChange={(event) => campoForm.setFieldValue("campo", event.currentTarget.value)}
                        placeholder="Ingrese el nombre del campo aquí..."
                        value={campoForm.values.campo}
                        w={"600px"}
                        error={campoForm.errors.campo}
                    />
                    <Button
                        ml={'10px'}
                        color="rgba(116, 180, 155, 1)"
                        type="submit"
                    >
                        Agregar
                    </Button>
                </Flex>
            </form>
            <InputBase component="div" multiline maw={'600px'} label='Campos actuales'>
                <Pill.Group>
                    {campos.length > 0 ? items : <p>No hay campos en el sistema</p>}
                </Pill.Group>
            </InputBase>
        </Stack>
    );
}