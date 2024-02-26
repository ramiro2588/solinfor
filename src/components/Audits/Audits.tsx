import { Group, PaperProps, ScrollArea, Table, Title, Image, Flex, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import moment from "moment";
import { Audit } from "../../interfaces/dominio";
import "./Audits.scss";
import CustomLoader from "../Global/Loader/CustomLoader";
import { useNavigate } from "react-router-dom";
import backButton from "../../resources/img/back-button.png";


export default function Audits(props: Readonly<{ mantine: PaperProps }>) {
    const [movimientos, setMovimientos] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/audits`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(data => setMovimientos(data))
            .then(() => setLoading(false))
            .catch(err => console.error(err));
    }, []);

    const generateTableRows = movimientos.map((movimiento) => (
        <Table.Tr key={movimiento.id}>
            <Table.Td>{movimiento.id}</Table.Td>
            <Table.Td>{movimiento.producto}</Table.Td>
            <Table.Td>{movimiento.campo}</Table.Td>
            <Table.Td>{moment(new Date(movimiento.fecha)).format("DD/MM/YYYY")}</Table.Td>
            <Table.Td>{movimiento.cantidad}</Table.Td>
            <Table.Td>{movimiento.unidad}</Table.Td>
            <Table.Td>{movimiento.tipo}</Table.Td>
            <Table.Td>{movimiento.actividad}</Table.Td>

        </Table.Tr>
    ));

    return (
        <CustomLoader isLoading={loading}>
            <Flex bg={props.mantine.bg} p="xl" h={"100vh"} w={'100%'} direction={'column'} >
                <Group mb={'lg'} mih={50} gap="md" justify="flex-start" align="flex-start" dir="row" wrap="wrap">
                    <Image className='pointer' mt="md"
                        onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PRODUCTO!)} src={backButton}
                        w="30px" draggable={false} />
                    <Title order={1} mt="xs" mb="md">
                        Movimiento de los productos
                    </Title>
                </Group>

                <ScrollArea>
                    <Table.ScrollContainer minWidth={'300px'}>
                        <Table className="table-scroll-container" w={'100%'} h={"500px"} stickyHeader highlightOnHover>
                            <Table.Thead bg={"#74b49b"} style={{ color: 'white' }}>
                                <Table.Tr style={{ padding: '15px' }}>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Producto</Table.Th>
                                    <Table.Th>Campo</Table.Th>
                                    <Table.Th>Fecha</Table.Th>
                                    <Table.Th>Cantidad</Table.Th>
                                    <Table.Th>Unidad</Table.Th>
                                    <Table.Th>Tipo</Table.Th>
                                    <Table.Th>Actividad</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody bg={"#f6f6f6"}>{generateTableRows}</Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </ScrollArea>

            </Flex>
        </CustomLoader>

    );
}