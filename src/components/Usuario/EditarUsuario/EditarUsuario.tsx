import {
    ActionIcon,
    Button,
    ComboboxItem,
    Container,
    Grid,
    Group,
    Modal,
    PaperProps,
    PasswordInput,
    Select,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {useLocation, useNavigate} from "react-router-dom";
import CustomLoader from "../../Global/Loader/CustomLoader";
import {useContext, useEffect, useState} from "react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Rol, Usuario} from "../../../interfaces/dominio";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";
import {ArrowLeftIcon} from "@radix-ui/react-icons";
import "./EditarUsuario.scss";
import Capitalize from "../../../utils/Capitalize";
import { AuthContext } from "../../Global/Account/RequireAuthentication";

export default function EditarUsuario(props: Readonly<{ mantine: PaperProps }>) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const matches = useMediaQuery('(min-width: 900px)');
    const [openedModalDeleteUser, {open: openModalDeleteUser, close: closeModalDeleteUser}] = useDisclosure(false);

    const [usuarioId, setUsuarioId] = useState(parseInt(useLocation().pathname.split('/')[3]));
    const [usuarioData, setUsuarioData] = useState<Usuario[]>([])
    const [comboboxRoles, setComboboxRoles] = useState([] as ComboboxItem[]);
    const [rolUser, setRolUser] = useState<string>("")
    const {currentUser} = useContext(AuthContext);
    const sameUser = currentUser?.id == usuarioId;


    const form = useForm({
        initialValues: {
            username: undefined as string | undefined,
            password: undefined as string | undefined,
            role: undefined as string | undefined
        }
    });

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/${usuarioId}`, {
            method: "GET",
            credentials: "include",
        })
            .then(resp => resp.json())
            .then(data => setUsuarioData(data as Usuario[]))
            .catch(err => console.log(err))

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/${usuarioId}/role`, {
            method: "GET",
            credentials: "include",
        })
            .then(resp => resp.json())
            .then(data => setRolUser(data.role))
            .catch(err => console.log(err))


        getDatosPrecargados()
            .then(() => setLoading(false));
    }, []);

    const getUsername = (): string => {
        const username = usuarioData.map(u => u.username);
        return username.toString();
    }


    async function getDatosPrecargados() {
        setLoading(true);
        await getRoles()
            .then(response => {
                if (response.status !== 200) {
                    throw new Error();
                }
                return response.json();
            })
            .then((response) => setComboboxRoles(response.map((rol: Rol) => {
                return {
                    value: rol.nombre,
                    label: Capitalize(rol.nombre),
                };
            })))
            .catch(() => {
                notifications.show({
                    title: 'Error!',
                    message: 'Error al traer la información precargada'
                });
            })
            .finally(() => setLoading(false));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        try {
            console.log(usuarioId)
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/${usuarioId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: getUsername(),
                    newPassword: form.values.password || "",
                    newRole: form.values.role || ""
                }),
            });

            if (response.status === 200) {
                setLoading(false);

                notifications.show({
                    title: "¡Usuario editado!",
                    message: "La información del usuario fue editada correctamente",
                    color: "green",
                });

                form.reset();
                navigate(`${process.env.REACT_APP_SOLINFOR_ROUTE_USERS!}`)
            } else {
                setLoading(false);
                notifications.show({
                    title: "Error",
                    message: "Ocurrió un error al editar al usuario, vuelva a intentarlo",
                    color: "red",
                });
            }
        } catch (e) {
            console.error("Error al enviar el formulario principal:", e);
        }
    }

    const handleDeleteUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user/${usuarioId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                setLoading(false);
                notifications.show({
                    title: 'Usuario eliminado',
                    message: 'El usuario fue eliminado correctamente.',
                    color: 'green'
                });

                closeModalDeleteUser();
                form.reset();
                navigate(`${process.env.REACT_APP_SOLINFOR_ROUTE_USERS!}`)
            } else {
                setLoading(false);
                notifications.show({
                    title: 'Error',
                    message: 'Error al eliminar el registro de usuario',
                    color: 'red'
                });
                closeModalDeleteUser();
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    }

    return (
        <CustomLoader isLoading={loading}>
            <Container fluid w={"100%"} p={0} className={""}>
                <Stack bg={props.mantine.bg} w={'100%'} p={'lg'} mih={"100vh"}>

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
                            Editar Usuario
                        </Title>
                    </Group>

                    <form onSubmit={handleSubmit} className="edit-user">
                        <Grid>
                            <Grid.Col span={12}>
                                <TextInput
                                    className="edit-user__input"
                                    label="Nombre de Usuario"
                                    radius="md"
                                    value={getUsername()}
                                    disabled
                                />

                                <PasswordInput
                                    className="edit-user__input"
                                    label={"Contraseña"}
                                    description={"¡Aviso! Si este campo no se completa, la contraseña no será editada, manteniendo la actual."}
                                    onChange={(event) => {
                                        form.setFieldValue("password", event.currentTarget.value);
                                    }}
                                    radius="md"
                                    value={form.values.password}
                                />


                                <Select
                                    className="edit-user__input"
                                    {...form.getInputProps("role")}
                                    comboboxProps={{offset: 0}}
                                    data={comboboxRoles}
                                    label="Rol (opcional)"
                                    nothingFoundMessage="No hay resultados"
                                    onChange={(event) => form.setFieldValue("role", event ?? undefined)}
                                    searchable
                                    value={form.values.role || rolUser}
                                    allowDeselect={false}
                                />
                            </Grid.Col>
                        </Grid>

                        <Group mt="xl" justify={matches ? "" : "center"}>
                            <Button
                                bg="#74b49b"
                                radius="md"
                                size={matches ? "xl" : "md"}
                                type="submit"
                            >
                                Editar usuario
                            </Button>
                            <Button
                                color="red"
                                onClick={openModalDeleteUser}
                                radius="md"
                                size={matches ? "xl" : "md"}
                                type="reset"
                                variant="outline"
                                disabled={sameUser}
                            >
                                Eliminar usuario
                            </Button>
                        </Group>

                        <Modal opened={openedModalDeleteUser} onClose={closeModalDeleteUser}
                               title={"Eliminar usuario"}
                               centered>
                            <Text size={"sm"} ta="center">A continuación, se eliminaran los datos del usuario
                                actual.</Text>
                            <Text size={"sm"} ta="center">¿Deseas continuar?</Text>

                            <Group justify="center" mt={"lg"}>
                                <Button variant="outline" color="red" radius="lg" onClick={handleDeleteUser}>
                                    Confirmar
                                </Button>

                                <Button bg="#74b49b" radius="lg" onClick={closeModalDeleteUser}>
                                    Regresar
                                </Button>
                            </Group>
                        </Modal>
                    </form>

                </Stack>
            </Container>
        </CustomLoader>
    )
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