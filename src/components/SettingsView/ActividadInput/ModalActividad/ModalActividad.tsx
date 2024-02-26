import {Button, Card, Flex, LoadingOverlay, Modal, NumberInput, Select, Text, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import {
    ActividadValidaciones,
    NombreActividad,
    Producto,
    ValidacionProducto
} from "../../../../interfaces/dominio";
import ModalProps from "../../../../interfaces/ModalProps";
import {useForm} from "@mantine/form";
import {PlusCircledIcon} from "@radix-ui/react-icons";
import {notifications} from '@mantine/notifications';

export default function ModalActividades(props: Readonly<ModalProps>) {
    let [productos, setProductos] = useState(new Array<Producto>)
    let [actividad, setActividad] = useState({
        nombreActividad: {id: 0, nombre: ''},
        validaciones: new Array<ValidacionProducto>
    } as ActividadValidaciones);

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
            }
        } catch (error) {
            setProductos([]);
        }
    }

    async function getValidaciones() {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/validaciones/${props.actividad?.id}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setActividad({
                    nombreActividad: props.actividad ? props.actividad : {id: 0, nombre: ''} as NombreActividad,
                    validaciones: data as ValidacionProducto[]
                });
            }
        } catch (error) {
            setActividad({nombreActividad: {id: 0, nombre: ''}, validaciones: []} as ActividadValidaciones)
        }
    }

    useEffect(() => {
        if (props.opened) {
            getProductos();
            if (props.accion == 'EDIT' && props.actividad && props.actividad?.id && props.actividad.nombre) {
                actividadForm.setFieldValue('nombre', props.actividad.nombre);
                getValidaciones()
            }
        } else {
            actividadForm.setFieldValue('nombre', '');
            setActividad({
                nombreActividad: {id: 0, nombre: ''} as NombreActividad,
                validaciones: []
            });
        }
    }, [props.opened])

    const actividadForm = useForm({
        initialValues: {
            nombre: ''
        }
    });

    const setValue = (event: number, type: string, index: number) => {
        switch (type) {
            case 'litrosMaximos':
                actividad.validaciones[index].litrosMaximos = event;
                break;
            case 'litrosMinimos':
                actividad.validaciones[index].litrosMinimos = event;
                break;
            case 'litrosOptimos':
                actividad.validaciones[index].litrosOptimos = event;
                break;
            default:
                break;
        }
        setActividad({
            nombreActividad: actividad.nombreActividad,
            validaciones: actividad.validaciones
        })
    }

    const productoRepetido = () => {
        let result = false;
        actividad.validaciones.forEach(validaciones => {
            let producto = actividad.validaciones.filter(x => x.idProducto == validaciones.idProducto).length > 1
            if (producto) result = true;
        });
        return result;
    }
    const productoValidacionInvalido = () => {
        return actividad.validaciones.some(validacion => validacion.litrosMinimos >= validacion.litrosOptimos || validacion.litrosOptimos >= validacion.litrosMaximos || validacion.litrosMinimos == undefined || validacion.litrosMaximos == undefined || validacion.litrosOptimos == undefined);
    }
    const selectVacio = () => {
        return actividad.validaciones.some(validacion => !validacion.idProducto || validacion.idProducto == 0);
    }
    const actividadSinNombre = () => {
        return !actividadForm.values.nombre
    }

    const disableButton = () => {
        return productoRepetido() || productoValidacionInvalido() || selectVacio() || actividadSinNombre();
    }

    const agregar = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/actividad`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: actividadForm.values.nombre,
                    validaciones: actividad.validaciones ? actividad.validaciones : []
                })
            });
            const data = await response.json();
            if (response.status == 200) {
                props.setActividades((data[0] as NombreActividad[]));
                props.onClose()
            } else {
                notifications.show({
                    title: 'Error',
                    message: data.msg,
                    color: 'red'
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error intente nuevamente.'
            })
        }
    }

    const editar = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/actividad`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(actividad)
            });
            const data = await response.json();
            if (response.status == 200) {
                props.onClose()
            } else {
                notifications.show({
                    title: 'Error',
                    message: data.msg,
                    color: 'red'
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error intente nuevamente.'
            })
        }
    }

    const eliminar = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/actividad/${actividad.nombreActividad.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (response.status == 200) {
                props.setActividades(props.actividades.filter(x => x.id !== actividad.nombreActividad.id));
                props.onClose();
            } else {
                notifications.show({
                    title: 'Error',
                    message: data.msg,
                    color: 'red'
                })
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error intente nuevamente.'
            })
        }
    }

    const itemsValidacion = actividad.validaciones.map((validacion, index) => {
        const producto = productos.find(p => p.id == validacion.idProducto)
        return <Card key={index} bg={'#F3F3F3'} mt={'20px'}>
            <Flex align={'flex-end'} justify={'space-between'}>
                <Select
                    error={
                        actividad.validaciones[index].idProducto === 0 ||
                        !actividad.validaciones[index].idProducto ||
                        actividad.validaciones.filter(x => x.idProducto == validacion.idProducto).length > 1
                    }
                    w={'50%'}
                    label="Producto"
                    data={productos.map(prod => prod.nombre)}
                    onChange={(value => {
                        const productoChanged = productos.findIndex(x => x.nombre == value)
                        validacion.idProducto = productos[productoChanged].id
                        setActividad({
                            nombreActividad: actividad.nombreActividad,
                            validaciones: actividad.validaciones
                        })
                    })}
                    value={producto?.nombre}
                ></Select>
                <Button
                    color="red"
                    onClick={() => {
                        const newValidaciones = actividad.validaciones.filter((v: ValidacionProducto, i: number) => i != index)
                        setActividad({
                            nombreActividad: actividad.nombreActividad,
                            validaciones: newValidaciones
                        } as ActividadValidaciones)
                    }}
                >
                    Eliminar
                </Button>
            </Flex>
            <Flex align={'center'} justify={'space-between'}>
                <NumberInput error={validacion.litrosMaximos <= validacion.litrosOptimos || !validacion.litrosMaximos}
                             label="Máximo" allowDecimal mt={'10px'} min={0}
                             onChange={(event) => setValue(event as number, 'litrosMaximos', index)}
                             value={validacion.litrosMaximos} hideControls w={'30%'}></NumberInput>
                <NumberInput error={validacion.litrosOptimos <= validacion.litrosMinimos || !validacion.litrosOptimos}
                             label="Optimo" allowDecimal mt={'10px'} min={0}
                             onChange={(event) => setValue(event as number, 'litrosOptimos', index)}
                             value={validacion.litrosOptimos} hideControls w={'30%'}></NumberInput>
                <NumberInput error={validacion.litrosMinimos < 0 || !validacion.litrosMinimos} label="Mínimo"
                             allowDecimal mt={'10px'} min={0}
                             onChange={(event) => setValue(event as number, 'litrosMinimos', index)}
                             value={validacion.litrosMinimos} hideControls w={'30%'}></NumberInput>
            </Flex>
        </Card>
    })

    return (
        <>
            <Modal
                opened={props.opened}
                onClose={props.onClose}
                title={props.titulo}
                size={'lg'}
                transitionProps={{transition: 'fade', duration: 200}}
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
            >
                <TextInput
                    error={actividadForm.values.nombre == ''}
                    readOnly={props.accion == 'EDIT'}
                    label="Actividad"
                    onChange={(event) => actividadForm.setFieldValue("nombre", event.currentTarget.value)}
                    placeholder="Ingrese el nombre de la actividad aqui..."
                    value={actividadForm.values.nombre}
                />
                <Flex align={'flex-end'} justify={'space-between'}>
                    <Text mt={'20px'}>Productos</Text>
                    <Button
                        disabled={actividad.validaciones.length >= productos.length}
                        color="rgba(116, 180, 155, 1)"
                        onClick={() => {
                            actividad.validaciones.push({
                                idNombreActividad: props.actividad?.id
                            } as ValidacionProducto);
                            setActividad({
                                nombreActividad: actividad.nombreActividad,
                                validaciones: actividad.validaciones
                            })
                        }}>
                        <PlusCircledIcon></PlusCircledIcon>
                    </Button>
                </Flex>
                {itemsValidacion}
                {props.accion == 'ADD' ? <Button onClick={agregar} disabled={disableButton()} mt={'20px'} w={'100%'}
                                                 color="rgba(116, 180, 155, 1)">Agregar</Button> :
                    <Button onClick={editar} disabled={disableButton()} mt={'20px'} w={'100%'}
                            color="rgba(116, 180, 155, 1)">Editar</Button>}
                {props.accion == 'EDIT' ? <Button onClick={eliminar} variant="default" mt={'20px'} w={'100%'} c={'red'}
                                                  color="rgba(116, 180, 155, 1)">Eliminar Actividad</Button> : <></>}
            </Modal>
        </>
    )
}