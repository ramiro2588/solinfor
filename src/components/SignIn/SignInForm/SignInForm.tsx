import "./SignInForm.scss";
import {Anchor, Button, Center, Group, Paper, PaperProps, PasswordInput, Stack, TextInput, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {notifications} from "@mantine/notifications";

export default function SignInForm(props: Readonly<{ mantine: PaperProps, setIsLoading: Function }>) {
    const navigate = useNavigate();
    const [credentialsAreInvalid, setCredentialsAreInvalid] = useState(false);
    const errorMessages = {
        username: {
            empty: "El nombre de usuario no puede estar vacío",
        },
        password: {
            empty: "La clave no puede estar vacía",
            invalid: "El nombre de usuario o clave son inválidos",
        },
    }
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value: string) => {
                if (!value) {
                    return errorMessages.username.empty;
                }
                if (credentialsAreInvalid) {
                    return errorMessages.password.invalid;
                }
                return null;
            },
            password: (value: string) => {
                if (!value) {
                    return errorMessages.password.empty;
                }
                if (credentialsAreInvalid) {
                    return errorMessages.password.invalid;
                }
                return null;
            }
        }
    });

    useEffect(() => {
        if (credentialsAreInvalid) {
            form.validate();
        }
    }, [credentialsAreInvalid])

    useEffect(() => {
        setCredentialsAreInvalid(false);
    }, [form.values.username, form.values.password]);

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        form.validate();
        if (!form.isValid()) {
            return;
        }
        props.setIsLoading(true);
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: form.values.username,
                password: form.values.password,
            })
        })
            .then(response => {
                if (response.status !== 200) {
                    if (response.status === 401) {
                        setCredentialsAreInvalid(true);
                        notifications.show({
                            color: "red",
                            message: errorMessages.password.invalid,
                        });
                        return;
                    }
                    throw new Error();
                }
                response.json()
                    .then(data => {
                        if (data.must_update_password) {
                            navigate(`${process.env.REACT_APP_SOLINFOR_ROUTE_CHANGE_PASSWORD!}/${data.username}`)
                            return;
                        }
                        navigate(process.env.REACT_APP_SOLINFOR_ROUTE_MAIN!);
                    })
            })
            .catch(() => {
                notifications.show({
                    color: "red",
                    message: "Error intentando ingresar",
                });
            })
            .finally(() => props.setIsLoading(false));
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
                        Ingresar
                    </Title>
                </Center>
                <form
                    className="login-form"
                    onSubmit={event => onSubmit(event)}
                >
                    <Stack py="lg">
                        <TextInput
                            className="login-form__input"
                            error={form.errors.username}
                            label="Usuario"
                            onChange={(event) => form.setFieldValue("username", event.currentTarget.value)}
                            placeholder="Ingrese su usuario"
                            radius="md"
                            value={form.values.username}
                        />
                        <PasswordInput
                            className="login-form__input"
                            error={form.errors.password}
                            label="Clave"
                            onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
                            placeholder="Ingrese su clave"
                            radius="md"
                            value={form.values.password}
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
                            Ingresar
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Center>
    );
}