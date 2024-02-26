import {useForm} from '@mantine/form';
import {
    ActionIcon,
    Button,
    FileButton,
    Flex,
    Grid,
    Group,
    Modal,
    Paper,
    PaperProps,
    ScrollArea,
    Space,
    Table,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import React, {FormEvent, useState} from "react";
import moment from "moment";
import {useDisclosure} from "@mantine/hooks";
import "./AltaPersonal.scss"
import {notifications} from "@mantine/notifications";
import '@mantine/notifications/styles.css';
import {useNavigate} from 'react-router-dom';
import CustomLoader from '../../Global/Loader/CustomLoader';
import {DocumentoFunctions, FileToUpload} from '../../../interfaces/dominio';
import {ArrowLeftIcon, TrashIcon} from "@radix-ui/react-icons";
import ConfirmarDescartarModal from "../../Actividad/ConfirmarDescartarModal/ConfirmarDescartarModal";
import downloadFileToUpload = DocumentoFunctions.downloadFileToUpload;

export default function AltaPersonal(props: Readonly<{ mantine: PaperProps }>) {
    const errorMessages = {
        nombreCompleto: {
            empty: "El nombre no puede estar vacío",
            format: "El nombre debe ser un nombre completo válido",
        },
        fechaNacimiento: {
            empty: "La fecha de nacimiento es requerida",
        },
        fechaIngreso: {
            empty: "La fecha de ingreso no puede estar vacia",
        },
        numeroCedula: {
            empty: "Su número de cedula no puede estar vacio",
            format: "La cédula debe ser válida, incluyendo puntos y el guión del dígito verificador",
        },
        telefonoContacto: {
            empty: "El telefono de contacto no puede estar vacio",
        },
        fechaVencimiento: {
            empty: "La fecha de vencimiento no puede ser vacía",
        },
        archivosParaSubir: {
            empty: "Se debe subir al menos un documento",
        }
    };
    const form = useForm({
        initialValues: {
            nombreCompleto: "",
            fechaNacimiento: "",
            fechaIngreso: "",
            numeroCedula: "",
            telefonoContacto: "",
            archivosParaSubir: [] as FileToUpload[],
        },
        validate: {
            nombreCompleto: (value) => {
                if (!value) {
                    return errorMessages.nombreCompleto.empty;
                }
                const oneNameAndAtLeastOneLastNameRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ]+(?:\s[A-Za-zÁáÉéÍíÓóÚúÑñ]+)*(?:\s[A-Za-zÁáÉéÍíÓóÚúÑñ]+)+$/;
                if (!oneNameAndAtLeastOneLastNameRegex.test(value)) {
                    return errorMessages.nombreCompleto.format;
                }
                return null;
            },
            numeroCedula: (value) => {
                if (!value) {
                    return errorMessages.numeroCedula.empty;
                }
                const cedulaRegex = /^(\d\.\d{3}\.\d{3}-\d|\d{3}\.\d{3}-\d)$/;
                if (!cedulaRegex.test(value)) {
                    return errorMessages.numeroCedula.format;
                }
                return null;
            },
            telefonoContacto: (value) => (value ? null : errorMessages.telefonoContacto.empty),
            fechaIngreso: (value) => (value ? null : errorMessages.fechaIngreso.empty),
            fechaNacimiento: (value) => (value ? null : errorMessages.fechaNacimiento.empty),
            archivosParaSubir: (value) => (value.length > 0 ? null : errorMessages.archivosParaSubir.empty),
        },
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonIsDisabled, setSubmitButtonIsDisabled] = useState(false);
    const [agregarDocumentoModalIsOpen, {open, close}] = useDisclosure(false);
    const [openDiscardModal, setOpenDiscardModal] = useState(false);

    function handleAddFileToUpload(fileToUpload: File, fechaDeVencimiento: string) {
        form.values.archivosParaSubir = [
            ...form.values.archivosParaSubir,
            {
                name: fileToUpload.name,
                file: fileToUpload,
                fechaDeVencimiento: fechaDeVencimiento
            }
        ];
        close();
        form.validate();
    }

    function handleRemoveFileToUpload(fileToRemove: FileToUpload) {
        form.values.archivosParaSubir = form.values.archivosParaSubir.filter(archivo => archivo !== fileToRemove);
        form.validate();
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        setSubmitButtonIsDisabled(true);
        event.preventDefault();
        form.validate();
        if (!form.isValid()) {
            setSubmitButtonIsDisabled(false);
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        form.values.archivosParaSubir.forEach(archivo => formData.append("file", archivo.file));
        formData.append("personal", JSON.stringify({
            nombre: form.values.nombreCompleto,
            fechaDeNacimiento: moment(form.values.fechaNacimiento).format("YYYY-MM-DD"),
            fechaDeIngreso: moment(form.values.fechaIngreso).format("YYYY-MM-DD"),
            cedula: form.values.numeroCedula,
            telefonoContacto: form.values.telefonoContacto,
            documentos: form.values.archivosParaSubir,
        }));
        await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal`, {
            method: "POST",
            credentials: "include",
            body: formData,
        })
            .then(async (response) => {
                if (response.status !== 200) {
                    const errorResponse = await response.json();
                    notifications.show({
                        title: "Error",
                        message: errorResponse.msg,
                        color: "red",
                    });
                    return;
                }
                notifications.show({
                    title: "Personal agregado",
                    message: "El personal fue agregado correctamente",
                    color: "green",
                });
                navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL!);
            })
            .catch(error => {
                notifications.show({
                    title: "Error",
                    message: error.msg,
                    color: "red",
                });
            })
            .finally(() => {
                setSubmitButtonIsDisabled(false);
                setIsLoading(false);
            });
    }

    return (
        <CustomLoader isLoading={isLoading}>
            <Paper
                bg={props.mantine?.bg}
                h="100%"
                mih="100dvh"
                px="75px"
                py="50px"
                w="100dvw">
                <Group>
                    <ActionIcon
                        aria-label="Settings"
                        color="red"
                        onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL!)}
                        radius="xl"
                        variant="outline"
                    >
                        <ArrowLeftIcon/>
                    </ActionIcon>
                    <Title order={1}>
                        Agregar Personal
                    </Title>
                </Group>

                <form
                    className="alta-personal"
                    onSubmit={handleSubmit}>
                    <Grid>
                        <Grid.Col>
                            <TextInput
                                className="alta-personal__input"
                                value={form.values.nombreCompleto}
                                error={form.errors.nombreCompleto}
                                label="Nombre completo"
                                onChange={(event) => form.setFieldValue("nombreCompleto", event.currentTarget.value)}
                                placeholder="Nombre completo del personal"
                            />
                            <TextInput
                                className="alta-personal__input"
                                value={form.values.fechaNacimiento}
                                error={form.errors.fechaNacimiento}
                                label="Fecha de nacimiento"
                                onChange={(e) => form.setFieldValue("fechaNacimiento", e.currentTarget.value)}
                                type="date"
                            />
                            <TextInput
                                className="alta-personal__input"
                                value={form.values.fechaIngreso}
                                error={form.errors.fechaIngreso}
                                label="Fecha de ingreso"
                                onChange={(e) => form.setFieldValue("fechaIngreso", e.currentTarget.value)}
                                type="date"
                            />
                            <TextInput
                                className="alta-personal__input"
                                value={form.values.numeroCedula}
                                error={form.errors.numeroCedula}
                                label="Número de cédula"
                                onChange={(event) => form.setFieldValue("numeroCedula", event.currentTarget.value)}
                                placeholder="1.234.567-8"
                            />
                            <TextInput
                                className="alta-personal__input"
                                value={form.values.telefonoContacto}
                                error={form.errors.telefonoContacto && errorMessages.telefonoContacto.empty}
                                type={"number"}
                                label="Teléfono de contacto"
                                onChange={(event) => {
                                    const inputValue = event.currentTarget.value.slice(0, 9);
                                    form.setFieldValue("telefonoContacto", inputValue);
                                }}
                                placeholder="099123456"
                            />
                        </Grid.Col>
                    </Grid>
                    <Space h="25px"/>
                    <ScrollArea>
                        <Paper>
                            <Flex bg="#74b49b" p="10px" justify="space-between" gap="15px" align="center">
                                <Title order={5} style={{color: "#fff"}}>
                                    Documentos a subir
                                </Title>
                                <Button onClick={open} bg="#39605a" radius="xl">
                                    Agregar
                                </Button>
                            </Flex>
                        </Paper>
                        <Table captionSide="bottom" bg={"#ebe6ea"} highlightOnHover>
                            <DocumentosTableHead filesToUpload={form.values.archivosParaSubir}/>
                            <DocumentosTableBody
                                filesToUpload={form.values.archivosParaSubir}
                                handleRemoveFileToUpload={handleRemoveFileToUpload}
                            />
                        </Table>
                        <Text c="red" size="sm" ta="start" mt="5px" ml="5px">
                            {form.errors.archivosParaSubir}
                        </Text>
                    </ScrollArea>

                    <Flex>
                        <Button
                            bg="#74b49b"
                            mt="sm"
                            type="submit"
                            disabled={submitButtonIsDisabled}
                        >
                            Dar de alta
                        </Button>
                        <Space w="15px"/>
                        <Button
                            mt="sm"
                            type="button"
                            onClick={() => setOpenDiscardModal(true)}
                            bg="red"
                        >
                            Descartar
                        </Button>
                    </Flex>
                </form>
                <AgregarDocumentosModal
                    opened={agregarDocumentoModalIsOpen}
                    close={close}
                    onSubmit={handleAddFileToUpload}/>
                <ConfirmarDescartarModal
                    close={() => setOpenDiscardModal(false)}
                    open={openDiscardModal}
                    onConfirm={() => {
                        navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL!);
                    }}
                />
            </Paper>

        </CustomLoader>
    );
};

function AgregarDocumentosModal(props: Readonly<{
    opened: boolean,
    close: VoidFunction,
    onSubmit: Function,
}>) {
    const [selectedFile, setSelectedFile] = useState(null as File | null);
    const [selectedFechaDeVencimiento, setSelectedFechaDeVencimiento] = useState(undefined as string | undefined);
    const [checkForErrors, setCheckForErrors] = useState(false);
    const selectedFileErrorMessage = checkForErrors && !selectedFile && "Debe seleccionar un archivo";
    const selectedFechaDeVencimientoErrorMessage = checkForErrors && !selectedFechaDeVencimiento && "Debe seleccionar una fecha de vencimiento";

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setCheckForErrors(true);
        if (!selectedFile || !selectedFechaDeVencimiento) {
            return;
        }
        props.onSubmit(selectedFile, selectedFechaDeVencimiento);
        handleClose();
    }

    function handleClose() {
        setSelectedFile(null);
        setSelectedFechaDeVencimiento(undefined);
        setCheckForErrors(false);
        props.close();
    }

    return (
        <Modal opened={props.opened} onClose={handleClose} title="Agregar documentos">
            <form onSubmit={handleSubmit}>
                <FileButton
                    accept="application/pdf"
                    onChange={(file) => setSelectedFile(file)}
                >
                    {(props) => (
                        <Button {...props} size="xs" type="button" variant="default">
                            Seleccione un documento
                        </Button>
                    )}
                </FileButton>
                {selectedFile ? (
                    <small style={{ display: "block", padding: "5px 0 0 5px" }}>
                        Archivo seleccionado: {selectedFile.name}
                    </small>
                ) : (
                    <small style={{ color: "red", display: "block", font: "12px Inter", padding: "5px 0 0 5px" }}>
                        {selectedFileErrorMessage}
                    </small>
                )}
                <Space h="15px" />
                <TextInput
                    type="date"
                    onChange={(event) => setSelectedFechaDeVencimiento(event.currentTarget.value)}
                    mt="md"
                    radius="md"
                    label="Fecha de Vencimiento"
                    placeholder="12/07/2026"
                />
                <small style={{ color: "red", display: "block", font: "12px Inter", padding: "5px 0 0 5px" }}>
                    {selectedFechaDeVencimientoErrorMessage}
                </small>
                <Space h="15px" />
                <Button type="submit" bg="#74b49b" fullWidth>
                    Guardar documento
                </Button>
            </form>
        </Modal>
    );
}

function DocumentosTableHead(props: Readonly<{ filesToUpload: FileToUpload[] }>) {
    if (props.filesToUpload.length === 0) {
        return (
            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>No hay documentos</Table.Td>
                </Table.Tr>
            </Table.Tbody>
        );
    }
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Documento</Table.Th>
                <Table.Th>Válido hasta</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    );
}

function DocumentosTableBody(props: Readonly<{ filesToUpload: FileToUpload[], handleRemoveFileToUpload: Function }>) {
    let keyCounter = 0;
    return (
        <Table.Tbody>
            {
                props.filesToUpload.map((fileToUpload) => (
                    <Table.Tr
                        key={++keyCounter}
                        bg={getColorBasedOnDate(fileToUpload.fechaDeVencimiento)}
                    >
                        <Table.Td>
                            <Button
                                maw="95%"
                                w="100%"
                                variant="default"
                                onClick={() => downloadFileToUpload(fileToUpload)}
                            >
                                {fileToUpload.file.name}
                            </Button>
                        </Table.Td>
                        <Table.Td
                            miw="110px"
                        >
                            {moment(fileToUpload.fechaDeVencimiento).format("DD-MM-YYYY")}
                        </Table.Td>
                        <Table.Td align="right">
                            <ActionIcon
                                aria-label="Settings"
                                bg="red"
                                color="white"
                                onClick={() => props.handleRemoveFileToUpload(fileToUpload)}
                                radius="xl"
                                variant="transparent"
                                w="100%"
                                maw="75px"
                                style={{border: "1px solid white"}}
                            >
                                <TrashIcon/>
                            </ActionIcon>
                        </Table.Td>
                    </Table.Tr>
                ))
            }
        </Table.Tbody>
    );
}

function getColorBasedOnDate(fechaDeVencimiento: string) {
    const currentDate = moment();
    const fileValidez = moment(fechaDeVencimiento);
    const differenceInMonths = fileValidez.diff(currentDate, 'months');
    const differenceInDays = fileValidez.diff(currentDate, 'days');

    let color;

    if (differenceInMonths <= 0 && differenceInDays < 0) {
        color = "red";
    } else if (differenceInMonths <= 2) {
        color = "yellow";
    } else {
        color = "green";
    }

    return color;
}