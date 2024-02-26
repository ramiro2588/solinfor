import "./RegisterUser.scss";
import {
    ActionIcon,
    Button,
    ComboboxItem,
    Grid,
    Group,
    Paper,
    PaperProps,
    Select,
    TextInput,
    Title
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Rol} from "../../interfaces/dominio";
import {notifications} from "@mantine/notifications";
import CustomLoader from "../Global/Loader/CustomLoader";
import {ArrowLeftIcon} from "@radix-ui/react-icons";
import ConfirmarDescartarModal from "../Actividad/ConfirmarDescartarModal/ConfirmarDescartarModal";

export default function RegisterUser(props: Readonly<{ mantine: PaperProps }>) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [comboboxRoles, setComboboxRoles] = useState([] as ComboboxItem[]);
    const errorMessages = {
        nombre: {
            empty: "El nombre no puede estar vacío",
        },
        username: {
            empty: "El nombre de usuario no puede estar vacío",
        },
        password: {
            empty: "La contraseña no puede estar vacía",
            requirements: "La contraseña debe incluir números y tener al menos 8 caracteres",
        },
        email: {
            requirements: "El correo debe ser una dirección válida",
        }
    }
    const form = useForm({
        initialValues: {
            nombre: undefined as string | undefined,
            username: undefined as string | undefined,
            email: undefined as string | undefined,
            role: undefined as string | undefined,
            password: undefined as string | undefined,
        },
        validate: {
            nombre: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.nombre.empty;
                }
                return null;
            },
            username: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.username.empty;
                }
                return null;
            },
            password: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.password.empty;
                }
                const regex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/; // Letras, números y al menos 8 caracteres
                if (!regex.test(value)) {
                    return errorMessages.password.requirements;
                }
                return null;
            },
            email: (value: string | undefined) => {
                if (!value) {
                    return null;
                }
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Ser una dirección de correo
                if (!regex.test(value)) {
                    return errorMessages.email.requirements;
                }
                return null;
            }
        },
    });

    useEffect(() => {
        getDatosPrecargados();
    }, []);

    const getDatosPrecargados = async () => {
        try {
            setLoading(true);
            const rolesResponse = await getRoles();
            if (rolesResponse.status == 200) {
                await rolesResponse.json()
                    .then(response => setComboboxRoles(response.map((rol: Rol) => {
                        return {
                            value: rol.nombre,
                            label: rol.nombre,
                        }
                    })));
            }
            setLoading(false);
        } catch (error) {
            notifications.show({
                title: 'Error!',
                message: 'Error al traer la información precargada'
            });
        } finally {
            setLoading(false);
        }
    }
    const [openDiscardModal, setOpenDiscardModal] = useState(false);

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        form.validate();
        if (!form.isValid()) {
            return;
        }
        const body = {
            username: form.values.username,
            password: form.values.password,
            email: form.values.email,
            name: form.values.nombre,
            role: form.values.role,
        }
        setLoading(true);
        postUsuario(body)
            .finally(() => setLoading(false));
    }

    return (
        <CustomLoader isLoading={loading}>
            <Paper
                bg={props.mantine?.bg}
                h="100%"
                mih="100dvh"
                px="lg"
                py="50px"
                w="100%"
            >
                <Group>
                    <ActionIcon
                        aria-label="Settings"
                        color="red"
                        onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_USERS!)}
                        radius="xl"
                        variant="outline"
                    >
                        <ArrowLeftIcon/>
                    </ActionIcon>
                    <Title order={1}>
                        Crear usuario
                    </Title>
                </Group>
                <form
                    className="register-user"
                    onSubmit={event => onSubmit(event)}
                >
                    <Grid>
                        <Grid.Col span={12}>
                            <TextInput
                                className="register-user__input"
                                label="Nombre"
                                placeholder="Nombre completo del nuevo usuario"
                                onChange={(event) => form.setFieldValue("nombre", event.currentTarget.value ?? undefined)}
                                error={form.errors.nombre}
                                value={form.values.nombre}
                            />
                            <TextInput
                                className="register-user__input"
                                label="Nombre de usuario"
                                placeholder="Nombre de usuario del nuevo usuario"
                                onChange={(event) => form.setFieldValue("username", event.currentTarget.value ?? undefined)}
                                error={form.errors.username}
                                value={form.values.username}
                            />
                            <TextInput
                                className="register-user__input"
                                label="Correo electrónico"
                                placeholder="Correo electrónico del nuevo usuario"
                                onChange={(event) => form.setFieldValue("email", event.currentTarget.value ?? undefined)}
                                error={form.errors.email}
                                value={form.values.email}
                            />
                            <TextInput
                                className="register-user__input"
                                label="Contraseña"
                                placeholder="Contraseña del nuevo usuario"
                                onChange={(event) => form.setFieldValue("password", event.currentTarget.value ?? undefined)}
                                error={form.errors.password}
                                value={form.values.password}
                            />
                            <Select
                                {...form.getInputProps("role")}
                                className="register-user__input"
                                comboboxProps={{offset: 0}}
                                data={comboboxRoles}
                                label="Rol (opcional)"
                                nothingFoundMessage="No hay resultados"
                                onChange={(event) => form.setFieldValue("role", event ?? undefined)}
                                placeholder="Rol del nuevo usuario"
                                searchable
                                value={form.values.role}
                                defaultValue="null"
                                error={form.errors.role}
                                allowDeselect={false}
                            />
                        </Grid.Col>
                    </Grid>
                    <ConfirmarDescartarModal
                        close={() => setOpenDiscardModal(false)}
                        open={openDiscardModal}
                        onConfirm={() => {
                            navigate(process.env.REACT_APP_SOLINFOR_ROUTE_USERS!);
                        }}
                    />
                    <Group mt="xl">
                        <Button
                            bg="#74b49b"
                            radius="md"
                            size="xl"
                            type="submit"
                        >
                            Registrar usuario
                        </Button>
                        <Button
                            color="red"
                            onClick={() => setOpenDiscardModal(true)}
                            radius="md"
                            size="xl"
                            type="reset"
                            variant="outline"
                        >
                            Descartar
                        </Button>
                    </Group>
                </form>
            </Paper>
        </CustomLoader>
    )

    async function postUsuario(body: any) {
        return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/register`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        })
            .then(async (response) => {
                if (![201, 202].includes(response.status)) {
                    const errorResponse = await response.json();
                    throw new Error(errorResponse.msg);
                }
                navigate(process.env.REACT_APP_SOLINFOR_ROUTE_USERS!);
            })
            .catch(error => {
                notifications.show({
                    title: "Error al intentar registrar un nuevo usuario",
                    message: error.message,
                });
            })
    }
}

async function getRoles() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/role`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}