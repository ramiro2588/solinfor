import "./AgregarActividad.scss";
import {Actividad, Campo, Personal, Producto, Unidad, ValoresProducto} from "../../interfaces/dominio";
import {
    ActionIcon,
    Button,
    ComboboxItem,
    Grid,
    Group,
    MultiSelect,
    Paper,
    PaperProps,
    Select,
    Table,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import AgregarProductoModal from "./AgregarProductoModal/AgregarProductoModal";
import ConfirmarDescartarModal from "./ConfirmarDescartarModal/ConfirmarDescartarModal";
import {ArrowLeftIcon, Cross1Icon} from "@radix-ui/react-icons";
import {FormEvent, useContext, useEffect, useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {useNavigate} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import CustomLoader from "../Global/Loader/CustomLoader";
import {AuthContext} from "../Global/Account/RequireAuthentication";

export default function AgregarActividad(props: Readonly<{
    mantine?: PaperProps
}>) {
    const {currentUser} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [comboboxActividades, setComboboxActividades] = useState([] as ComboboxItem[]);
    const [comboboxCampos, setComboboxCampos] = useState([] as ComboboxItem[]);
    const [comboboxPersonal, setComboboxPersonal] = useState([] as ComboboxItem[]);
    const [comboboxProductos, setComboboxProductos] = useState([] as ComboboxItem[]);
    const [comboboxUnidades, setComboboxUnidades] = useState([] as ComboboxItem[]);
    const errorMessages = {
        actividad: {
            empty: "La actividad realizada no puede estar vacía",
        },
        campo: {
            empty: "El campo trabajado no puede estar vacío",
        },
        fecha: {
            empty: "La fecha no puede estar vacía",
        },
        hectareas: {
            empty: "Las hectáreas no pueden estar vacías",
            minimumValue: "La cantidad de hectáreas debe ser mayor a cero",
            invalidInput: "El valor ingresado no es un número válido",
        },
        personal: {
            empty: "El personal no puede estar vacío",
        },
        producto: {
            cantidad: {
                empty: "La cantidad no puede estar vacía",
                minimumValue: "La cantidad debe ser mayor a cero",
            },
            unidad: {
                empty: "La unidad no puede estar vacía",
            },
        },
    }
    const form = useForm({
        initialValues: {
            actividad: undefined as string | undefined,
            campo: undefined as string | undefined,
            fecha: "",
            hectareas: "",
            personal: [] as number[],
            productos: [] as Producto[],
            valoresProductos: new Map() as Map<number, ValoresProducto>,
        },
        validate: {
            actividad: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.actividad.empty;
                }
                return null;
            },
            campo: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.campo.empty;
                }
                return null;
            },
            fecha: (value: string) => {
                if (!value) {
                    return errorMessages.fecha.empty;
                }
                return null;
            },
            hectareas: (value: string) => {
                if (!value) {
                    return errorMessages.hectareas.empty;
                }
                if (+value <= 0) {
                    return errorMessages.hectareas.minimumValue;
                }
                if (isNaN(+value)) {
                    return errorMessages.hectareas.invalidInput;
                }
                return null;
            },
            personal: (value: number[]) => {
                if (value.length === 0) {
                    return errorMessages.personal.empty;
                }
                return null;
            },
            productos: (value: Producto[]) => {
                return null;
            },
            valoresProductos: (value: Map<number, ValoresProducto>) => {
                value.forEach(item => {
                    if (!item?.cantidad) {
                        return errorMessages.producto.cantidad.empty;
                    }
                    if (+item.cantidad <= 0) {
                        return errorMessages.producto.cantidad.minimumValue;
                    }
                    if (!item.unidad) {
                        return errorMessages.producto.unidad.empty;
                    }
                })
                return null;
            },
        },
    });
    const navigate = useNavigate();

    useEffect(() => {
        getDatosPrecargados();
    }, []);

    const getDatosPrecargados = async () => {
        try {
            setLoading(true);
            const actividadesResponse = await getActividades();
            if (actividadesResponse.status == 200) {
                await actividadesResponse.json()
                    .then(response => setComboboxActividades(response.map((actividad: Actividad) => {
                        return {
                            value: actividad.nombre,
                            label: actividad.nombre,
                        }
                    })));
            }
            const camposResponse = await getCampos();
            if (camposResponse.status == 200) {
                await camposResponse.json()
                    .then(response => setComboboxCampos(response.map((campo: Campo) => {
                        return {
                            value: campo.nombre,
                            label: campo.nombre,
                        }
                    })));
            }
            const personalResponse = await getPersonal();
            if (personalResponse.status == 200) {
                await personalResponse.json()
                    .then(response => setComboboxPersonal(response.map((personal: Personal) => {
                        return {
                            value: personal.id.toString(),
                            label: personal.nombre + "-" + personal.cedula,
                        }
                    })));
            }
            const productosResponse = await getProductos();
            if (productosResponse.status == 200) {
                await productosResponse.json()
                    .then(response => setComboboxProductos(response.map((producto: Producto) => {
                        return {
                            value: JSON.stringify(producto),
                            label: producto.nombre,
                        }
                    })));
            }
            const unidadesResponse = await getUnidades();
            if (unidadesResponse.status == 200) {
                await unidadesResponse.json()
                    .then(response => setComboboxUnidades(response.map((unidad: Unidad) => {
                        return {
                            value: unidad.nombre,
                            label: unidad.nombre,
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
    const [openAddProductsModal, {open, close}] = useDisclosure(false);
    const [openDiscardModal, setOpenDiscardModal] = useState(false);

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        form.validate();
        if (form.isValid()) {
            const body = {
                autor: currentUser?.username,
                nombre: form.values.actividad,
                campo: form.values.campo,
                fecha: form.values.fecha,
                hectareas: form.values.hectareas,
                personal: form.values.personal,
                productos: form.values.productos
                    .map((producto: any) => {
                        const valoresProducto = form.values.valoresProductos.get(producto.id);
                        return {
                            id: producto.id,
                            cantidad: valoresProducto!.cantidad,
                            unidad: valoresProducto!.unidad,
                        }
                    }),
            }
            setLoading(true);
            fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/actividad`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body),
            })
                .then(() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES!))
                .catch(error => {
                    notifications.show({
                        title: "Error al intentar ingresar una nueva actividad",
                        message: error.message,
                    });
                })
                .finally(() => setLoading(false));
        }
    }

    function addProductos(productos: Producto[]) {
        form.setFieldValue("productos", [...form.values.productos, ...productos]);
    }

    function obtenerProductosNoSeleccionados() {
        return comboboxProductos
            .filter(producto => !form.values.productos
                .some(p => p.id === JSON.parse(producto.value).id));
    }

    return (
        <CustomLoader isLoading={loading}>
            <Paper
                bg={props.mantine?.bg}
                h="100%"
                mih="100dvh"
                px="75px"
                py="50px"
                w="100dvw"
            >
                <Group>
                    <ActionIcon
                        aria-label="Settings"
                        color="red"
                        onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES!)}
                        radius="xl"
                        variant="outline"
                    >
                        <ArrowLeftIcon/>
                    </ActionIcon>
                    <Title order={1}>
                        Agregar Actividad
                    </Title>
                </Group>
                <form
                    className="register-user"
                    onSubmit={event => onSubmit(event)}
                >
                    <Grid>
                        <Grid.Col span={12}>
                            <Select
                                {...form.getInputProps("actividad")}
                                comboboxProps={{offset: 0}}
                                data={comboboxActividades}
                                label="Actividad que se realizó"
                                nothingFoundMessage="No hay resultados"
                                onChange={(event) => form.setFieldValue("actividad", event ?? undefined)}
                                placeholder="Actividad"
                                searchable
                                value={form.values.actividad}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Select
                                {...form.getInputProps("campo")}
                                comboboxProps={{offset: 0}}
                                data={comboboxCampos}
                                label="Campo donde se realizó"
                                nothingFoundMessage="No hay resultados"
                                onChange={(event) => form.setFieldValue("campo", event ?? undefined)}
                                placeholder="Campo"
                                searchable
                                value={form.values.campo}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                {...form.getInputProps("fecha")}
                                label="Fecha de la actividad"
                                onChange={(event) => form.setFieldValue("fecha", event.currentTarget.value)}
                                type="date"
                                value={form.values.fecha}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base: 12, sm: 4}}>
                            <TextInput
                                {...form.getInputProps("hectareas")}
                                label="Hectáreas realizadas"
                                onChange={(event) => form.setFieldValue("hectareas", event.currentTarget.value)}
                                placeholder="Cantidad de hectáreas"
                                w="100%"
                            />
                        </Grid.Col>
                        <Grid.Col span={{base: 12, sm: 8}}>
                            <MultiSelect
                                {...form.getInputProps("personal")}
                                comboboxProps={{offset: 0}}
                                data={comboboxPersonal}
                                label="Personal que la realizó"
                                nothingFoundMessage="No hay resultados"
                                onChange={(event) => {
                                    form.setFieldValue("personal", event?.map(p => +p));
                                }}
                                placeholder="Personal"
                                value={form.values.personal.map(p => p.toString())}
                                w="100%"
                                clearable
                                searchable
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Table.ScrollContainer minWidth="400px">
                                <Table verticalSpacing="md"
                                       {...form.getInputProps("valoresProductos")}
                                >
                                    {
                                        form.values.productos.length > 0
                                            ? <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>
                                                        Producto
                                                    </Table.Th>
                                                    <Table.Th>
                                                        Cantidad
                                                    </Table.Th>
                                                    <Table.Th colSpan={2}>
                                                        Unidad
                                                    </Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            : ""
                                    }
                                    <Table.Tbody>
                                        {
                                            form.values.productos.map((producto, index) => {
                                                return (
                                                    <Table.Tr
                                                        {...form.getInputProps("valoresProductos")}
                                                        key={producto.nombre}
                                                    >
                                                        <Table.Td>
                                                            <Group w="100%" maw="250px">
                                                                <div>
                                                                    <Text fz="sm" fw={500}>
                                                                        {producto.nombre}
                                                                    </Text>
                                                                    <Text c="dimmed" fz="xs">
                                                                        {producto.marca}
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <TextInput
                                                                defaultValue="0"
                                                                onChange={(event) => {
                                                                    form.values.valoresProductos.set(producto.id, {
                                                                        cantidad: event.currentTarget.value,
                                                                        unidad: form.values.valoresProductos.get(producto.id)?.unidad ?? "",
                                                                    })
                                                                }}
                                                                w="100px"
                                                            />
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Select
                                                                data={comboboxUnidades}
                                                                onChange={(event) => {
                                                                    form.values.valoresProductos.set(producto.id, {
                                                                        cantidad: form.values.valoresProductos.get(producto.id)?.cantidad ?? "",
                                                                        unidad: event ?? "",
                                                                    })
                                                                }}
                                                                placeholder="-"
                                                                searchable
                                                                w="75px"
                                                            />
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <ActionIcon
                                                                aria-label="Settings"
                                                                bg="none"
                                                                c="black"
                                                                onClick={(event) => {
                                                                    form.removeListItem("productos", +event.currentTarget.value);
                                                                }}
                                                                value={index}
                                                            >
                                                                <Cross1Icon/>
                                                            </ActionIcon>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                );
                                            })
                                        }
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                            <Button
                                bg="grey"
                                fullWidth
                                onClick={open}
                            >
                                Agregar producto
                            </Button>
                        </Grid.Col>
                    </Grid>
                    <AgregarProductoModal
                        addElements={addProductos}
                        close={close}
                        data={obtenerProductosNoSeleccionados()}
                        open={openAddProductsModal}
                    />
                    <ConfirmarDescartarModal
                        close={() => setOpenDiscardModal(false)}
                        open={openDiscardModal}
                        onConfirm={() => {
                            navigate(process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES!);
                        }}
                    />
                    <Group mt="xl">
                        <Button
                            bg="#74b49b"
                            h="50px"
                            radius="md"
                            size="xl"
                            type="submit"
                        >
                            Confirmar Actividad
                        </Button>
                        <Button
                            color="red"
                            h="50px"
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
    );
}

async function getActividades() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/actividades`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}

async function getCampos() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/campo`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}

async function getPersonal() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}

async function getProductos() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/producto`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}

async function getUnidades() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/unidades`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}