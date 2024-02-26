import {Button, Flex, TextInput} from "@mantine/core";
import {notifications} from '@mantine/notifications';
import {useForm} from "@mantine/form";
import {useEffect} from "react";

export default function NotificacionPersonalInput() {
    const errorMessages = {
        emailPersonal: {
            empty: "La direccion de E-Mail no puede ser vacía",
        }
    }

    useEffect(() => {
        setEmailPersonal();
    }, []);

    async function setEmailPersonal(): Promise<void> {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/email/EMAIL_NOTIFICATION_PERSONAL`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            if (response.status == 200) {
                let data = await response.json();
                emailPersonalForm.setValues({
                    emailPersonal: data[0]?.nombre
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error!',
                message: 'Error al traer la información precargada'
            })
        }
    }

    const emailPersonalSubmit = async (event: { preventDefault: () => void; }) => {
        try {
            event.preventDefault();
            let response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/email`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    tipo: 'EMAIL_NOTIFICATION_PERSONAL',
                    email: emailPersonalForm.values.emailPersonal
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
                    message: 'Notificaciones de Personal fue actualizado correctamente',
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error!',
                message: 'Error al traer la información precargada.',
            })
        }
    }

    const emailPersonalForm = useForm({
        initialValues: {
            emailPersonal: ''
        },
        validate: {
            emailPersonal: (value: string) => value ? null : errorMessages.emailPersonal.empty,
        }
    });

    return <form onSubmit={emailPersonalSubmit}>
        <Flex
            my={'20px'}
            align={'flex-end'}>
            <TextInput
                error={emailPersonalForm.errors.emailPersonal}
                label="Notificaciones de Personal"
                onChange={(event) => emailPersonalForm.setFieldValue("emailPersonal", event.currentTarget.value)}
                placeholder="Ingrese la dirección E-Mail aqui..."
                value={emailPersonalForm.values.emailPersonal}
                w={'100%'}
                maw={"600px"}
            />
            <Button
                ml={'10px'}
                color="rgba(116, 180, 155, 1)"
                type="submit">Actualizar
            </Button>
        </Flex>
    </form>
}