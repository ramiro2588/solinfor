import "./VerActividades.scss"

import {ReactElement, useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {notifications} from '@mantine/notifications';
import {Badge, Button, Container, Flex, PaperProps, ScrollArea, Select, Table, Tooltip} from "@mantine/core";
import moment from "moment";
import {ValidacionProducto} from "../../../interfaces/dominio";
import {Actividad} from "../../../classes/Actividad";
import {ActividadMasterdata} from "../../../classes/ActividadMasterdata";
import {MovimientoProducto} from "../../../classes/MovimientoProducto";
import CustomLoader from "../../Global/Loader/CustomLoader";
import {useMediaQuery} from '@mantine/hooks';

export default function VerActividades(props: Readonly<{ mantine: PaperProps }>) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dataActividadMasterdata, setDataActividadMasterdata] = useState<ActividadMasterdata[]>([]);
    const [actividadSeleccionada, setActividadSeleccionada] = useState<string | null>(null);
    const [dataCampo, setDataCampo] = useState<ActividadMasterdata[]>([]);
    const [campoSeleccionado, setCampoSeleccionado] = useState<string | null>(null);
    const [actividadFiltrada, setActividadFiltrada] = useState<Actividad[] | null>(null);
    const [validacionesData, setValidacionesData] = useState([] as ValidacionProducto[]);
    const [movimientoProductoData, setMovimientoProductoData] = useState([] as MovimientoProducto[]);

    const [datosActividad, setDatosActividad] = useState<Actividad[]>([]);
    const [rows, setRows] = useState<ReactElement[]>([]);

    const matches = useMediaQuery('(min-width: 900px)');

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/actividades`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => setDataActividadMasterdata(data))
            .catch(error => console.error('Error:', error))

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/campo`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => setDataCampo(data))
            .catch(error => console.error('Error:', error));

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/actividad`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(data => setDatosActividad(data))
            .catch(error => console.error("Error:", error));

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/validaciones`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(data => {
                setValidacionesData(data);
            })
            .catch(err => console.error("Error", err));

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/movimientoProducto`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(data => {
                setMovimientoProductoData(data);
            })
            .catch(err => console.error("Error", err))
            .finally(() => setLoading(false))

    }, []);


    function validarActividad(actividad: Actividad) {
        const movimientos = movimientoProductoData.filter(mov => mov.actividad == actividad.id);
        const validaciones = validacionesData.filter(validacion => validacion.idNombreActividad == actividad.nombre);
        const resultado = [] as string[];
        const productosUtilizados: number[] = [];
        movimientos.forEach(movimiento => {
            if (!productosUtilizados.some(x => x = movimiento.producto)) {
                productosUtilizados.push(movimiento.producto);
            }
        })
        let seUtilizaronTodosLosProductos = true;
        validaciones.forEach(v => {
            if (!movimientos.some(m => m.producto == v.idProducto)) {
                seUtilizaronTodosLosProductos = false;
            }
        })
        if (seUtilizaronTodosLosProductos) {
            movimientos.forEach(mov => {
                const validacion = validaciones.find(val => val.idProducto == mov.producto);
                if (validacion) {
                    const masQueMaximo = (mov.cantidad / actividad.hectareas) > validacion.litrosMaximos;
                    const menosQueMinimo = (mov.cantidad / actividad.hectareas) < validacion.litrosMinimos;
                    const esOptimo = (mov.cantidad / actividad.hectareas) == validacion.litrosOptimos;
                    if (masQueMaximo || menosQueMinimo) {
                        resultado.push('red');
                    }
                    if (esOptimo) {
                        resultado.push('green');
                    }
                    if (!esOptimo && !masQueMaximo && !menosQueMinimo) {
                        resultado.push('yellow');
                    }
                }
            })
            if (resultado.some(x => x == 'red')) {
                return <Badge w={'100%'} color="red">No cumple</Badge>
            }
            if (resultado.some(x => x == 'yellow')) {
                return <Badge w={'100%'} color="yellow">Aceptable</Badge>
            }
            return <Badge w={'100%'} color="green">Optimo</Badge>
        } else {
            return <Badge w={'100%'} color="red">No cumple</Badge>
        }
    }

    const nombreActividad = (id: number): string => {
        const actividad = dataActividadMasterdata.find(act => act.id === id);
        return actividad ? actividad.nombre : '';
    }

    const nombreCampo = (id: number): string => {
        const campo = dataCampo.find(act => act.id === id);
        return campo ? campo.nombre : '';
    }

    const filtrarActividadesPorAmbos = () => {
        if (datosActividad && actividadSeleccionada && campoSeleccionado) {
            const idActividad = parseInt(actividadSeleccionada, 10);
            const idCampo = parseInt(campoSeleccionado, 10);
            const actividad = datosActividad.filter(x => x.nombre === idActividad && x.campo === idCampo);
            setActividadFiltrada(actividad);
            return actividad;
        } else {
            setActividadFiltrada(null);
            return [];
        }
    };


    const filtrarActividadesPorIdActividad = (id: number) => {
        if (datosActividad) {
            const actividad = datosActividad.filter(x => x.nombre == id)
            setActividadFiltrada(actividad)
            return actividad;
        } else {
            return [];
        }
    };

    const filtrarActividadesPorIdCampo = (id: number) => {
        if (datosActividad) {
            const actividad = datosActividad.filter(x => x.campo == id)
            setActividadFiltrada(actividad)
            return actividad;
        } else {
            return [];
        }
    }

    const handleActividadChange = (selectedOption: string | null) => {
        setActividadSeleccionada(selectedOption ?? '');
    };

    const handleCampoChange = (selectedOption: string | null) => {
        setCampoSeleccionado(selectedOption ?? '');
    };

    useEffect(() => {
        const actividad = actividadSeleccionada ?? '';
        const campo = campoSeleccionado ?? '';

        if (actividad !== '' || campo !== '') {
            if (actividad !== '' && campo !== '') {
                filtrarActividadesPorAmbos();
            } else if (actividad !== '') {
                filtrarActividadesPorIdActividad(parseInt(actividad, 10));
            } else {
                filtrarActividadesPorIdCampo(parseInt(campo, 10));
            }
        } else {
            setActividadFiltrada(null);
        }
    }, [actividadSeleccionada, campoSeleccionado]);

    const handleVerActividadClick = () => {
        navigate(process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES_AGREGAR!)
    };

    useEffect(() => {
        if (actividadFiltrada) {
            if (actividadFiltrada.length > 0) {
                if (actividadSeleccionada || campoSeleccionado) {
                    actividadFiltrada.sort(compararActividades);
                    const newRows = actividadFiltrada.filter(x => nombreCampo(x.campo) != '').map((dato) => (
                        <Table.Tr key={dato.id} className="pointer">
                            <Table.Td>{nombreActividad(dato.nombre)}</Table.Td>
                            <Table.Td>{nombreCampo(dato.campo)}</Table.Td>
                            <Table.Td>{moment(dato.fecha).format("DD/MM/YYYY")}</Table.Td>
                            <Table.Td>{dato.hectareas}</Table.Td>
                            <Table.Td>{validarActividad(dato)}</Table.Td>
                            <Table.Td>{dato.autor}</Table.Td>

                        </Table.Tr>
                    ));

                    setRows(newRows);
                }
            } else {
                setActividadFiltrada(null);
                setActividadSeleccionada(null);
                setCampoSeleccionado(null);

                notifications.show({
                    color: 'red',
                    title: 'No se encontraron actividades',
                    message: 'El filtro indicado no encontró actividades que coincidan.',
                    autoClose: 4500,
                })
            }
        } else {
            datosActividad.sort(compararActividades);
            const newRows = datosActividad.filter(x => nombreCampo(x.campo) != '').map((dato) => (
                <Table.Tr key={dato.id} className="pointer">
                    <Table.Td>{nombreActividad(dato.nombre)}</Table.Td>
                    <Table.Td>{nombreCampo(dato.campo)}</Table.Td>
                    <Table.Td>{moment(dato.fecha).format("DD/MM/YYYY")}</Table.Td>
                    <Table.Td>{dato.hectareas}</Table.Td>
                    <Table.Td>{validarActividad(dato)}</Table.Td>
                    <Table.Td>{dato.autor}</Table.Td>

                </Table.Tr>
            ));

            setRows(newRows);
        }
    }, [actividadFiltrada, datosActividad])


    function exportExcel() {
        try {
            setLoading(true);
            fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/actividad/export`, {
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
                    a.download = `actividades-solinfor-${fechaFormateada}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(a.href);
                    document.body.removeChild(a);
                })
        } catch (error) {
            notifications.show({
                color: 'red',
                message: 'Error al exportar las actividades, intente nuevamente.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <CustomLoader isLoading={loading}>
            <Container fluid className={"container-root"}>
                <Flex bg={props.mantine.bg} p="xl" h={"100vh"} direction={'column'}>
                    <Flex w={'100%'} bg={'#D9D9D9'} direction={matches ? 'row' : 'column'} align={'center'}
                          justify={'space-between'} p={'lg'} gap={'10px'}>
                        <Select
                            w={matches ? '25%' : '100%'}
                            placeholder="Actividad"
                            data={dataActividadMasterdata.map(actividad => ({
                                    label: actividad.nombre,
                                    value: actividad.id.toString()
                                })
                            )}
                            value={actividadSeleccionada}
                            onChange={handleActividadChange}
                            clearable
                        />
                        <Select
                            w={matches ? '25%' : '100%'}
                            placeholder="Campo"
                            data={dataCampo.map(campo => ({
                                    label: campo.nombre,
                                    value: campo.id.toString()
                                })
                            )}
                            value={campoSeleccionado}
                            maxDropdownHeight={200}
                            onChange={handleCampoChange}
                            clearable
                        />
                        <Button w={matches ? '25%' : '100%'} className={"button-ver-actividades"} bg="#74b49b"
                                radius="md" type="submit" onClick={handleVerActividadClick}>
                            Agregar Actividad
                        </Button>
                        <Tooltip label='Se exportarán todas las actividades' position="bottom" offset={5}>
                            <Button w={matches ? '25%' : '100%'} className={"button-ver-actividades"} color="#74b49b"
                                    variant="outline" radius="md" type="submit" onClick={exportExcel}>
                                Exportar
                            </Button>
                        </Tooltip>

                    </Flex>

                    <ScrollArea>
                        <Table.ScrollContainer minWidth={500}>
                            <Table mt={"xl"} stickyHeader className="table-scroll-container" highlightOnHover>
                                <Table.Thead bg={"#74b49b"} style={{color: 'white'}}>
                                    <Table.Tr style={{padding: '15px'}}>
                                        <Table.Th>Actividad</Table.Th>
                                        <Table.Th>Campo</Table.Th>
                                        <Table.Th>Fecha</Table.Th>
                                        <Table.Th>Hectareas</Table.Th>
                                        <Table.Th>Estado</Table.Th>
                                        <Table.Th>Usuario</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody bg={"#d9d9d9"}>{rows}</Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    </ScrollArea>
                </Flex>
            </Container>
        </CustomLoader>
    );
}

function compararActividades(a: Actividad, b: Actividad): number {
    if (a.fecha < b.fecha) {
        return 1;
    } else if (a.fecha > b.fecha) {
        return -1;
    }
    return 0;
}