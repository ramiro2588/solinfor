import { Button, Flex, InputBase, LoadingOverlay, Pill, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { notifications } from '@mantine/notifications';
import { Producto } from "../../../interfaces/dominio";
import { useMediaQuery } from "@mantine/hooks";



export default function ProductosInput() {
    let [productos, setProductos] = useState([] as Producto[]);
    let [error, setError] = useState(false);
    const matches = useMediaQuery('(max-width: 900px)');

    const errorMessages = {
        producto: {
            empty: "El producto no puede estar vacío",
        },
        tipo: {
            empty: "El tipo no puede estar vacío",
        }
    }

    async function getProductos() {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/producto`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setProductos(data as Producto[]);
            } else {
                setError(true);
                notifications.show({
                    title: 'Error!',
                    message: data.msg,
                })
            }
        } catch (error) {
            setError(true);
            notifications.show({
                title: 'Error!',
                message: 'Error al obtener los productos.',
            })
        }
    }

    useEffect(() => {
        getProductos();
    }, [])

    const onSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        productoForm.validate();
        if (!productoForm.isValid()) {
            return
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/producto`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: productoForm.values.producto,
                    marca: productoForm.values.marca,
                    tipo: productoForm.values.tipo,
                })
            });
            let data = await response.json();
            if (data.msg) {
                notifications.show({
                    message: data.msg,
                    color: 'red'
                })
            }
            else {
                setProductos(data)
                notifications.show({
                    message: 'Producto agregado con exito',
                    color: 'green'
                })
            }
        } catch (e) {
            notifications.show({
                message: e as string,
                color: 'red'
            })
        }
    }

    const onRemove = (id: number) => {
        return async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/producto/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                });
                let data = await response.json();
                if(data.message){
                    notifications.show({
                        message: data.message,
                        color: 'red'
                    })
                    return;
                }
                setProductos(productos.filter(producto => producto.id !== id));
            } catch (e) {
                notifications.show({
                    message: e as string,
                    color: 'red'
                })
            }
        }
    }

    const productoForm = useForm({
        initialValues: {
            producto: '',
            marca: '',
            tipo: ''
        },
        validate: {
            producto: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.producto.empty;
                }
                return null;
            },
            tipo: (value: string | undefined) => {
                if (!value) {
                    return errorMessages.tipo.empty;
                }
                return null;
            }
        }
    });

    const items = productos.map(producto => {
        return (<Pill key={producto.id} bg={'rgba(116, 180, 155, 1)'} c={'white'} withRemoveButton
            onRemove={onRemove(producto.id)}>
            {`${producto.nombre} ${producto.marca ? "- " + producto.marca : ''}`}
        </Pill>)
    })

    return (
        <Stack my={'20px'}>
            <form onSubmit={onSubmit}>
                <Flex
                    gap={'sm'}
                    direction={matches ? 'column' : 'row'}
                >
                    <TextInput
                        autoComplete="none"
                        label="Producto"
                        onChange={(event) => productoForm.setFieldValue("producto", event.currentTarget.value)}
                        value={productoForm.values.producto}
                        error={productoForm.errors.producto}
                        maw={matches ? '100%' : '350px'}
                        w={'100%'}
                    />
                    <TextInput
                        autoComplete="none"
                        label="Marca"
                        onChange={(event) => productoForm.setFieldValue("marca", event.currentTarget.value)}
                        value={productoForm.values.marca}
                        w={'100%'}
                        maw={matches ? '100%' : '150px'}
                    />
                    <Select
                        data={['Líquido', 'Sólido']}
                        label="Tipo"
                        onChange={(event) => productoForm.setFieldValue("tipo", event ? event : '')}
                        value={productoForm.values.tipo}
                        error={productoForm.errors.tipo}
                        w={'100%'} maw={matches ? '100%' : '100px'}
                    >

                    </Select>
                    <Button
                        ml={'10px'}
                        color="rgba(116, 180, 155, 1)"
                        type="submit"
                        mt={'25px'}
                        maw={matches ? '100%' : undefined}
                    >
                        Agregar
                    </Button>
                </Flex>
            </form>
            <InputBase component="div" multiline maw={'600px'} label='Productos actuales'>
                <Pill.Group>
                    {productos.length > 0 ? items : <p>No hay productos en el sistema</p>}
                </Pill.Group>
            </InputBase>
        </Stack>
    );
}