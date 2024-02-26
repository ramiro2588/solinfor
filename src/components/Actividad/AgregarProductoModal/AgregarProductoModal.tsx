import "./AgregarProductoModal.scss";
import {Button, Checkbox, ComboboxItem, Group, Modal, Paper, ScrollArea, Table, TextInput} from "@mantine/core";
import {Producto} from "../../../interfaces/dominio";
import {useEffect, useState} from "react";

export default function AgregarProductoModal(props: Readonly<{
    data: ComboboxItem[],
    addElements: Function,
    open: boolean,
    close: () => void,
}>) {
    const initialValues = {
        selection: [] as string[],
        productosSeleccionados: [] as Producto[],
        search: "",
        filteredData: props.data,
    }
    const [selection, setSelection] = useState(initialValues.selection);
    const [productosSeleccionados, setProductosSeleccionados] = useState(initialValues.productosSeleccionados);
    const [search, setSearch] = useState(initialValues.search);
    const [filteredData, setFilteredData] = useState(initialValues.filteredData);

    useEffect(() => {
        setSelection(initialValues.selection);
        setProductosSeleccionados(initialValues.productosSeleccionados);
        setSearch(initialValues.search);
        setFilteredData(initialValues.filteredData);
    }, [props.open])

    useEffect(() => {
        if (!search) {
            setFilteredData(props.data);
        } else {
            setFilteredData(props.data.filter(item => {
                const producto = JSON.parse(item.value);
                return producto.nombre.toLowerCase().includes(search.toLowerCase())
                    || producto.marca?.toLowerCase().includes(search.toLowerCase());
            }));
        }
    }, [search]);

    const toggleRow = (id: string) =>
        setSelection((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    const toggleAll = () =>
        setSelection((current) => (current.length === props.data.length ? [] : props.data.map((item) => {
            const producto = JSON.parse(item.value);
            return producto.id;
        })));

    useEffect(() => {
        setProductosSeleccionados(props.data.map(comboBoxItem => JSON.parse(comboBoxItem.value))
            .filter(producto => selection.includes(producto.id)));
    }, [selection]);

    function agregarProductosYCerrarModal() {
        props.addElements(productosSeleccionados);
        props.close();
    }

    return (
        <Modal
            opened={props.open}
            onClose={() => {
                props.close();
            }}
            title="Agregar productos"
        >
            <Paper>
                {
                    props.data.length > 0 ? (
                            <Group>
                                <TextInput
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Filtrar productos"
                                    value={search}
                                />
                                <ScrollArea w="100%">
                                    {
                                        filteredData.length > 0
                                            ? <Table striped>
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>
                                                            <Checkbox
                                                                checked={selection.length === props.data.length}
                                                                className="pointer"
                                                                indeterminate={selection.length > 0 && selection.length !== props.data.length}
                                                                onChange={toggleAll}
                                                            />
                                                        </Table.Th>
                                                        <Table.Th className="unselectable pointer">
                                                            Nombre
                                                        </Table.Th>
                                                        <Table.Th className="unselectable pointer">
                                                            Marca
                                                        </Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {
                                                        filteredData.map(item => {
                                                            const producto = JSON.parse(item.value);
                                                            return (
                                                                <Table.Tr
                                                                    className="pointer"
                                                                    key={producto.id}
                                                                    onClick={() => toggleRow(producto.id)}
                                                                >
                                                                    <Table.Td>
                                                                        <Checkbox
                                                                            checked={selection.includes(producto.id)}
                                                                            className="pointer"
                                                                            onChange={() => toggleRow(producto.id)}
                                                                            onClick={() => toggleRow(producto.id)}
                                                                            value={item.value}
                                                                        />
                                                                    </Table.Td>
                                                                    <Table.Td className="unselectable">
                                                                        {producto.nombre}
                                                                    </Table.Td>
                                                                    <Table.Td className="unselectable">
                                                                        {producto.marca}
                                                                    </Table.Td>
                                                                </Table.Tr>
                                                            );
                                                        })
                                                    }
                                                </Table.Tbody>
                                            </Table>
                                            : "No se han encontrado resultados"
                                    }
                                </ScrollArea>
                                <Button
                                    bg="#74b49b"
                                    bottom="0"
                                    disabled={productosSeleccionados.length === 0}
                                    fullWidth
                                    h="50px"
                                    my="25px"
                                    onClick={() => agregarProductosYCerrarModal()}
                                    radius="md"
                                    size="sm"
                                    type="submit"
                                >
                                    Agregar
                                </Button>
                            </Group>)
                        : "No hay productos disponibles para agregar."
                }
            </Paper>
        </Modal>
    )
}
