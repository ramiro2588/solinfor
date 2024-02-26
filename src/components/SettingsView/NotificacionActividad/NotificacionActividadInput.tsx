import {Button, Flex, LoadingOverlay, TextInput} from "@mantine/core";
import {notifications} from '@mantine/notifications';
import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";

export default function NotificacionActividadInput() {
    const errorMessages = {
        emailActividad: {
            empty: "La direccion de E-Mail no puede ser vacía",
        }
    }

    useEffect(() => {
        setEmailActividad();
    }, []);

    async function setEmailActividad(): Promise<void> {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/email/EMAIL_NOTIFICATION_ACTIVIDADES`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            if (response.status == 200) {
                let data = await response.json();
                emailActividadForm.setValues({
                    emailActividad: data[0]?.nombre
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error!',
                message: 'Error al traer la información precargada'
            })
        }
    }

    const emailActividadSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        let response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/email`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                tipo: 'EMAIL_NOTIFICATION_ACTIVIDADES',
                email: emailActividadForm.values.emailActividad
            }),
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (response.status != 200) {
            notifications.show({
                title: 'Error!',
                message: data.msg,
            })
        } else {
            notifications.show({
                title: 'Actualizado correctemente!',
                message: 'Notificaciones de Actividad fue actualizado correctamente',
            })
        }
    }

    const emailActividadForm = useForm({
        initialValues: {
            emailActividad: ''
        },
        validate: {
            emailActividad: (value: string) => value ? null : errorMessages.emailActividad.empty
        }
    });

    return <form onSubmit={emailActividadSubmit}>
        <Flex
            align={'flex-end'}>
            <TextInput
                error={emailActividadForm.errors.emailActividad}
                label="Notificaciones de Actividad"
                onChange={(event) => emailActividadForm.setFieldValue("emailActividad", event.currentTarget.value)}
                placeholder="Ingrese la dirección E-Mail aqui..."
                value={emailActividadForm.values.emailActividad}
                w={'90%'}
                maw={"600px"}
            />
            <Button
                ml={'10px'}
                color="rgba(116, 180, 155, 1)"
                type="submit">Actualizar</Button>
        </Flex>
    </form>
}