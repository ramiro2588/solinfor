import './PostProducto.scss'
import '../../../App.scss'
import { Button, Flex, Group, Image, NumberInput, Radio, Select, Stack, Title } from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { useForm } from "@mantine/form";
import { notifications } from '@mantine/notifications'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Campo, Producto } from "../../../interfaces/dominio";
import backButton from "../../../resources/img/back-button.png";
import CustomLoader from '../../Global/Loader/CustomLoader';


export default function PostProducto() {
    const errorMessages = {
        requerido: "Este campo es requerido"
    }
    const [loading, setLoading] = useState(false);
    const [productos, setProductos] = useState([] as Producto[]);
    const [campos, setCampos] = useState([] as Campo[]);
    const [unidades, setUnidades] = useState([] as { id: number, nombre: string, tipo: string }[]);

    const navigate = useNavigate();
    const [disableLt, setDisableLt] = useState(false);
    const [disableKg, setDisableKg] = useState(false);

    async function getProductos() {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/producto", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setProductos(data);
            }
        } catch (error) {
            setProductos([]);
        } finally {
            setLoading(false);
        }
    }

    async function getCampos() {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/masterdata/campo", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setCampos(data);
            }
        } catch (error) {
            setCampos([])
        } finally {
            setLoading(false);
        }
    }

    async function getUnidades() {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/masterdata/unidades", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            if (response.status == 200) {
                setUnidades(data);
            }
        } catch (error) {
            setUnidades([])
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProductos();
        getCampos();
        getUnidades();
    }, [])

    const onSubmit = async (event: any) => {
        event.preventDefault();
        form.validate();
        if (form.isValid()) {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:3000/producto/stock", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        idNombreCampo: campos.find(campo => campo.nombre == form.values.campo)?.id,
                        idProducto: productos.find(producto => producto.nombre == form.values.producto)?.id,
                        unidad: unidades.find(x => x.nombre === form.values.unidad)?.id,
                        cantidad: form.values.cantidad,
                        fecha: form.values.fecha
                    })
                });
                const data = await response.json();
                if(data.id){
                    notifications.show({
                        message: 'Stock agregado correctamente',
                        color: 'green'
                    })
                    navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PRODUCTO!);
                }
                else{
                    notifications.show({
                        message: data.msg,
                        color: 'red'
                    })
                }
            } catch (error) {
                notifications.show({
                    message: error as string,
                    color: 'red'
                })
            } finally {
                setLoading(false);
            }
        }
    }

    const form = useForm({
        initialValues: {
            producto: "",
            campo: "",
            unidad: "",
            cantidad: 0,
            fecha: ''
        },
        validate: {
            producto: (value: string) => {
                if (value === "" || value == undefined) {
                    return errorMessages.requerido;
                }
            },
            campo: (value: string) => {
                if (value === "") {
                    return errorMessages.requerido;
                }
            },
            unidad: (value: string) => {
                if (value === "") {
                    return errorMessages.requerido;
                }
            },
            cantidad: (value: number) => {
                if (value <= 0 || isNaN(value)) {
                    return errorMessages.requerido;
                }
            },
            fecha: (value: string) => {
                if (value === "" || value == undefined) {
                    return errorMessages.requerido;
                }
            }
        }
    });

    useEffect(() => {
        const producto = productos.find(x => x.nombre === form.values.producto);
        if (producto?.tipo === 'Sólido') {
            setDisableKg(false);
            setDisableLt(true);
        }
        else if (producto?.tipo === 'Líquido') {
            setDisableKg(true);
            setDisableLt(false);
        }
        else {
            setDisableKg(true);
            setDisableLt(true);
        }
    }, [form.values.producto])

    return (<CustomLoader isLoading={loading}>
        <Stack
            className='overflow-y-scroll'
            w={'100%'}
            bg={"#D9D9D9"}
            mih={"100vh"}
            py={'xl'}
            px={'xl'}>
            <Flex align={'center'}>
                <Image className='pointer' mt="md"
                    onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PRODUCTO!)} src={backButton}
                    w="30px" draggable={false} />
                <Title ml={'30px'}>Ingreso de Producto</Title>
            </Flex>
            <form onSubmit={onSubmit}>
                <Select
                    my={'md'}
                    data={productos.map(producto => producto.nombre)}
                    label='Producto'
                    placeholder="Seleccione el producto a ingresar..."
                    maw={'600px'}
                    withAsterisk
                    onChange={(event) => {
                        let producto = productos.find(x => x.nombre == event);
                        form.setFieldValue('producto', event as string);
                        form.setFieldValue('unidad', (producto?.tipo == 'Líquido' ? 'lt' : (producto?.tipo == 'Sólido' ? 'kg' : '')))
                    }}
                    error={form.errors.producto}
                ></Select>
                <Select
                    my={'md'}
                    data={campos.map(campo => campo.nombre)}
                    label='Campo'
                    placeholder="Seleccione el campo a ingresar..."
                    maw={'600px'}
                    withAsterisk
                    onChange={(event) => {
                        form.setFieldValue('campo', event as string)
                    }}
                    error={form.errors.campo}
                ></Select>
                <Radio.Group
                    my={'md'}
                    label="Unidad de medida"
                    description="Seleccione en que unidad se ingresará el producto"
                    maw={'600px'}
                    onChange={(event) => {
                        form.setFieldValue('unidad', event as string)
                    }}
                    value={form.values.unidad}
                >
                    <Group mt="xs">
                        <Radio value={'lt'} disabled={disableLt} label={'Kilos'} color="#74b49b" />
                        <Radio value={'kg'} disabled={disableKg} label={'Litros'} color="#74b49b" />
                    </Group>
                </Radio.Group>
                <NumberInput
                    my={'md'}
                    label="Cantidad a ingresar"
                    placeholder="Ingrese la cantidad del Producto"
                    maw={'600px'}
                    allowDecimal
                    min={0}
                    withAsterisk
                    onChange={(event) => {
                        form.setFieldValue('cantidad', parseFloat(event as string))
                    }}
                    error={form.errors.cantidad}
                >
                </NumberInput>
                <DateInput
                    my={'md'}
                    label="Fecha de ingreso"
                    placeholder="Ingrese la fecha de ingreso"
                    maw={'600px'}
                    withAsterisk
                    maxDate={new Date()}
                    valueFormat="DD/MM/YYYY"
                    onChange={(event) => {
                        form.setFieldValue('fecha', event ? `${event.getFullYear()}/${event.getMonth()}/${event.getDate()}` : '');
                    }}
                    error={form.errors.fecha}
                />
                <Button
                    my={'md'}
                    bg="#74b49b"
                    maw={'600px'}
                    fullWidth
                    radius="md"
                    type="submit"
                >
                    Confirmar Ingreso
                </Button>
            </form>
        </Stack>
    </CustomLoader>);
}