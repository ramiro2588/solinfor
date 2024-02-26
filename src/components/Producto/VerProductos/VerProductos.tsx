import './VerProductos.scss';
import '../../../App.scss'
import {useContext, useEffect, useState} from "react";
import CustomLoader from "../../Global/Loader/CustomLoader";
import {Badge, Button, Flex, ScrollArea, Select, Stack, Table, Title, Tooltip} from "@mantine/core";
import {Permiso, Stock} from "../../../interfaces/dominio";
import {notifications} from "@mantine/notifications";
import * as reactRouter from 'react-router';
import {AuthContext} from "../../Global/Account/RequireAuthentication";

export function VerProductos() {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState([] as Stock[]);
    const [campos, setCampos] = useState([] as string[]);
    const [filtered, setFiltered] = useState([] as Stock[])
    const [value, setValue] = useState<string | null>('');
    const [error, setError] = useState(false);
    const {currentUser} = useContext(AuthContext);

    const navigate = reactRouter.useNavigate();

    useEffect(() => {
        getStock();
    }, [])

    useEffect(() => {
        if (value == null) {
            setFiltered(stock);
        } else {
            setFiltered(stock.filter(x => x.campo_nombre == value));
        }
    }, [value])

    useEffect(() => {
        let result: string[] = []
        stock.forEach(x => {
            if (!result.some(c => c == x.campo_nombre)) {
                result.push(x.campo_nombre);
            }
        })
        setCampos(result)
    }, [campos])

    async function getStock() {
        try {
            setLoading(true);
            const result = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/producto/stock`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            if (result.status == 200) {
                const data = await result.json();
                if (Array.isArray(data)) {
                    data.sort(ordenarStocksPorNombre)
                    setStock(data as Stock[]);
                    setFiltered(data as Stock[]);
                } else {
                    notifications.show({
                        color: 'red',
                        message: data.message
                    })
                }
            } else {
                setError(true);
                notifications.show({
                    color: 'red',
                    message: 'Error al ingresar al stock, intenta nuevamente.'
                })
            }
        } catch (error) {
            setError(true);
            console.error(error);
            notifications.show({
                color: 'red',
                message: 'Error al ingresar al stock, intenta nuevamente.'
            })
        } finally {
            setLoading(false)
        }
    }

    function exportExcel() {
        try {
            setLoading(true);
            fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/producto/export`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Accept-Charset": "utf-8"
                }
            })
                .then(response => response.blob())
                .then(blob => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    const date = new Date();
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const fechaFormateada = `${day}/${month}/${year}`;
                    a.download = `stock-solinfor-${fechaFormateada}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(a.href);
                    document.body.removeChild(a);
                })
        } catch (error) {
            notifications.show({
                color: 'red',
                message: 'Error al exportar todo el stock, intente nuevamente.'
            })
        } finally {
            setLoading(false)
        }
    }

    const rows = filtered.map((x) => (
        <Table.Tr key={`${x.campo} ${x.producto}`}>
            <Table.Td>{x.campo_nombre}</Table.Td>
            <Table.Td>{x.producto_nombre}</Table.Td>
            <Table.Td>{x.producto_marca}</Table.Td>
            <Table.Td>{x.producto_tipo}</Table.Td>
            <Table.Td><Badge color={x.cantidad < 0 ? 'red' : 'green'}>{x.cantidad}</Badge></Table.Td>
        </Table.Tr>
    ));


    return <CustomLoader isLoading={loading}>
        <Stack
            w={'100%'}
            bg={"#D9D9D9"}
            mih={"100vh"}
            py={'xl'}
            px={'xl'}>
            <Flex justify={'space-between'} align={'center'}>
                <Title>Productos</Title>
                <Button onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_POST_PRODUCTO!)}
                        bg="#74b49b"
                        display={currentUser?.role?.permissions.includes(Permiso.AGREGAR_PRODUCTO) ? "block" : "none"}
                        radius="md">
                    Cargar stock
                </Button>
            </Flex>
            <Flex align={'flex-end'} justify={'space-between'} gap={'sm'}>
                <Select label="Filtrar por campo" data={campos} value={value} onChange={setValue} w={'80%'}/>
                <Tooltip label="Se exportará todo el stock" position="bottom" offset={5}>
                    <Button onClick={exportExcel} color="#74b49b" variant="outline" radius="md">
                        Exportar
                    </Button>
                </Tooltip>
            </Flex>
            <ScrollArea>
                <Table.ScrollContainer w={'100%'} minWidth={500} h={'fit-content'}>
                    <Table w={'100%'} mb={'lg'} className='overflow-x-scroll table' stickyHeader highlightOnHover>
                        <Table.Thead bg={"#74b49b"} style={{color: 'white'}}>
                            <Table.Tr>
                                <Table.Th>Campo</Table.Th>
                                <Table.Th>Producto</Table.Th>
                                <Table.Th>Marca</Table.Th>
                                <Table.Th>Tipo</Table.Th>
                                <Table.Th>Cantidad</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {stock.length > 0 ? rows : ''}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </ScrollArea>
            {error ? <Flex justify={'center'} w={'100%'}>Error al traer los datos</Flex> : (stock.length == 0 ?
                <Flex justify={'center'} w={'100%'}>No hay productos para mostrar</Flex> : '')}
            <Button onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_AUDITS!)}
                    color="#74b49b"
                    radius="md">
                Ver movimientos
            </Button>
        </Stack>
    </CustomLoader>
}

function ordenarStocksPorNombre(stockA: Stock, stockB: Stock): number {
    if (stockA.campo_nombre < stockB.campo_nombre) return -1;
    if (stockA.campo_nombre > stockB.campo_nombre) return 1;

    if (stockA.producto_nombre < stockB.producto_nombre) return -1;
    if (stockA.producto_nombre > stockB.producto_nombre) return 1;

    if (stockA.producto_marca < stockB.producto_marca) return -1;
    if (stockA.producto_marca > stockB.producto_marca) return 1;

    return 0;
}