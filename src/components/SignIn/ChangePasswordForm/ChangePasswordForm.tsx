import "./ChangePasswordForm.scss";
import { Anchor, Button, Center, Group, Paper, PaperProps, PasswordInput, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChangePasswordForm(props: Readonly<{ mantine: PaperProps, setIsLoading: Function }>) {
    const username = useLocation().pathname.split('/')[2];
    const navigate = useNavigate();

    const errorMessages = {
        password: {
            empty: "La clave no puede estar vacía",
            doesNotMatch: "Las claves deben ser iguales",
            repeatedPassword: "La nueva clave no puede ser igual a la actual."
        },
    }
    const form: any = useForm({
        initialValues: {
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
        validate: {
            password: (value: string) => {
                if (!value) {
                    return errorMessages.password.empty;
                }
                return null;
            },
            newPassword: (value: string) => {
                if (!value) {
                    return errorMessages.password.empty;
                }
                if (value === form.values.password) {
                    return errorMessages.password.repeatedPassword;
                }
                return null;
            },
            confirmPassword: (value: string) => {
                if (!value) {
                    return errorMessages.password.empty;
                }
                if (value !== form.values.newPassword) {
                    return errorMessages.password.doesNotMatch;
                }
                return null;
            }
        }
    });

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        form.validate();
        if (!form.isValid()) {
            return;
        }
        props.setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/changePassword`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: form.values.password,
                    newPassword: form.values.newPassword,
                })
            })
            if(response.status == 200){
                navigate(process.env.REACT_APP_SOLINFOR_ROUTE_MAIN!);
            }
        } catch (error) {
            console.log(error);
        }
        props.setIsLoading(false);
    }

    return (
        <Center>
            <Paper
                bg={props.mantine.bg}
                p="xl"
                radius="md"
                w="100dvw"
                maw="400px"
                withBorder {...props}
            >
                <Center>
                    <Title
                        mt="xl"
                        order={2}
                    >
                        Ingrese una nueva clave
                    </Title>
                </Center>
                <form
                    className="change-password-form"
                    onSubmit={event => onSubmit(event)}
                >
                    <Stack py="lg">
                        <PasswordInput
                            className="change-password__input"
                            error={form.errors.password}
                            label="Ingrese su clave"
                            onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
                            placeholder="Clave"
                            radius="md"
                            value={form.values.password}
                        />
                        <PasswordInput
                            className="change-password__input"
                            error={form.errors.newPassword}
                            label="Ingrese su nueva clave"
                            onChange={(event) => form.setFieldValue("newPassword", event.currentTarget.value)}
                            placeholder="Nueva clave"
                            radius="md"
                            value={form.values.newPassword}
                        />
                        <PasswordInput
                            className="change-password__input"
                            error={form.errors.confirmPassword}
                            label="Confirme su clave"
                            onChange={(event) => form.setFieldValue("confirmPassword", event.currentTarget.value)}
                            placeholder="Vuelva a ingresar su nueva clave"
                            radius="md"
                            value={form.values.confirmPassword}
                        />
                    </Stack>
                    <Group
                        justify="space-between"
                        mb="xl"
                    >
                        <Anchor
                            c="dimmed"
                            component="button"
                            size="xs"
                            type="button"
                        />
                        <Button
                            bg="#74b49b"
                            fullWidth
                            h="50px"
                            radius="md"
                            type="submit"
                        >
                            Confirmar
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Center>
    );
}