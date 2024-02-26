import "./EditarPersonal.scss";
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
import "../AltaPersonal/AltaPersonal"
import '@mantine/notifications/styles.css';
import "../AltaPersonal/AltaPersonal.scss"
import {useForm} from "@mantine/form";
import {Documento, DocumentoFunctions, Personal} from "../../../interfaces/dominio";
import CustomLoader from "../../Global/Loader/CustomLoader";
import {ArrowLeftIcon, TrashIcon} from "@radix-ui/react-icons";
import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import moment from "moment";
import ConfirmarDescartarModal from "../../Actividad/ConfirmarDescartarModal/ConfirmarDescartarModal";
import downloadDocumento = DocumentoFunctions.downloadDocumento;

let idPersonal: number;

export default function EditarPersonal(props: Readonly<{ mantine: PaperProps }>) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [documentosModalIsOpen, setDocumentosModalIsOpen] = useState(false);
    const [openDiscardModal, setOpenDiscardModal] = useState(false);
    const form = useForm({
        initialValues: {
            nombre: "",
            fechaDeNacimiento: "",
            fechaDeIngreso: "",
            cedula: "",
            telefono: "",
            documentos: [] as Documento[],
        },
        validate: {},
    });
    idPersonal = parseInt(useLocation().pathname.split('/')[3]);

    useEffect(() => {
        precargarDatos();
    }, [])

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        form.validate();
        if (!form.isValid) {
            return;
        }
        return fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal/${idPersonal}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: form.values.nombre,
                fechaDeNacimiento: form.values.fechaDeNacimiento,
                fechaDeIngreso: form.values.fechaDeIngreso,
                cedula: form.values.cedula,
                telefonoContacto: form.values.telefono,
            }),
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error();
                }
                notifications.show({
                    color: "green",
                    message: "Los cambios fueron guardados exitosamente",
                })
                return response.json();
            })
            .catch(() => {
                notifications.show({
                    color: 'red',
                    message: "Hubo un error intentando obtener información sobre el personal",
                })
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
                w="100dvw"
            >
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
                        Editar personal
                    </Title>
                </Group>
                <form
                    className="edit-personal"
                    onSubmit={onSubmit}
                >
                    <Grid>
                        <Grid.Col>
                            <TextInput
                                className="edit-personal__input"
                                label="Nombre completo"
                                onChange={(event) => form.setFieldValue("nombre", event.currentTarget.value ?? undefined)}
                                error={form.errors.nombre}
                                value={form.values.nombre}
                            />
                            <TextInput
                                className="edit-personal__input"
                                type="date"
                                error={form.errors.fechaDeNacimiento}
                                value={form.values.fechaDeNacimiento}
                                onChange={event => form.setFieldValue("fechaDeNacimiento", event.currentTarget.value)}
                                label="Fecha de nacimiento"
                            />
                            <TextInput
                                className="edit-personal__input"
                                type="date"
                                error={form.errors.fechaDeIngreso}
                                value={form.values.fechaDeIngreso}
                                onChange={event => form.setFieldValue("fechaDeIngreso", event.currentTarget.value)}
                                label="Fecha de ingreso"
                            />
                            <TextInput
                                className="edit-personal__input"
                                label="Número de cédula"
                                onChange={(event) => form.setFieldValue("cedula", event.currentTarget.value ?? undefined)}
                                error={form.errors.cedula}
                                value={form.values.cedula}
                            />
                            <TextInput
                                className="edit-personal__input"
                                label="Teléfono de contacto"
                                onChange={(event) => form.setFieldValue("telefono", event.currentTarget.value ?? undefined)}
                                error={form.errors.telefono}
                                value={form.values.telefono}
                            />
                            <Space h="25px"/>
                            <Flex>
                                <Button type="submit" bg="#74b49b">
                                    Guardar cambios
                                </Button>
                                <Space w="15px"/>
                                <Button
                                    bg="red"
                                    onClick={() => setOpenDiscardModal(true)}
                                >
                                    Descartar
                                </Button>
                            </Flex>
                        </Grid.Col>
                    </Grid>
                    <Space h="75px"/>
                    <Grid>
                        <Grid.Col>
                            <ScrollArea>
                                <Paper>
                                    <Flex bg="#74b49b" p="10px" justify="space-between" align="center">
                                        <Title order={5} c="#fff">
                                            Administrar documentos
                                        </Title>
                                        <Space w="15px"/>
                                        <Button
                                            bg="#39605a" radius="xl"
                                            onClick={() => setDocumentosModalIsOpen(true)}
                                        >
                                            Agregar
                                        </Button>
                                    </Flex>
                                    <Table miw="300px">
                                        <DocumentsTableHead documentos={form.values.documentos}/>
                                        <DocumentsTableBody documentos={form.values.documentos}/>
                                    </Table>
                                </Paper>
                            </ScrollArea>
                        </Grid.Col>
                    </Grid>
                </form>
                <DocumentosModal
                    opened={documentosModalIsOpen}
                    close={onDocumentosModalClose}
                    documentos={form.values.documentos}
                    setDocumentos={(documentos: Documento[]) => {
                        form.setFieldValue("documentos", documentos);
                    }}
                />
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

    function onDocumentosModalClose() {
        setDocumentosModalIsOpen(false);
    }

    function precargarDatos() {
        getPersonal(idPersonal)
            .then(personal => {
                form.values.nombre = personal.nombre;
                form.values.fechaDeNacimiento = moment(personal.fechaDeNacimiento).format("YYYY-MM-DD");
                form.values.fechaDeIngreso = moment(personal.fechaDeIngreso).format("YYYY-MM-DD");
                form.values.cedula = personal.cedula;
                form.values.telefono = personal.telefonoContacto;
                form.values.documentos = personal.documentos;
            })
            .finally(() => setIsLoading(false));
    }

    async function getPersonal(id: number): Promise<Personal> {
        return fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal/${id}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error();
                }
                return response.json();
            })
            .catch(() => {
                notifications.show({
                    color: 'red',
                    message: "Hubo un error intentando obtener información sobre el personal",
                })
            });
    }
}

function DocumentsTableHead(props: Readonly<{ documentos: Documento[] }>) {
    return props.documentos.length === 0
        ? <></>
        : <Table.Thead>
            <Table.Tr>
                <Table.Th>Documento</Table.Th>
                <Table.Th miw="110px">Válido hasta</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
}

function DocumentsTableBody(props: Readonly<{ documentos: Documento[] }>) {
    const [deleteDocumentoModalIsOpen, setDeleteDocumentoModalIsOpen] = useState(false);
    const [documentoToDelete, setDocumentoToDelete] = useState(undefined as Documento | undefined);

    function closeDeleteDocumentoModal() {
        setDocumentoToDelete(undefined);
        setDeleteDocumentoModalIsOpen(false);
    }

    function openDeleteDocumentModal(documento: Documento) {
        setDocumentoToDelete(documento);
        setDeleteDocumentoModalIsOpen(true);
    }

    function deleteDocumento() {
        if (!documentoToDelete) {
            return;
        }
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal/documento/${documentoToDelete.id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            }
        })
            .then(() => window.location.reload())
            .catch(() => {
                notifications.show({
                    color: 'red',
                    message: "Hubo un error intentando obtener información sobre el personal",
                })
            });
    }

    return <Table.Tbody>
        {
            props.documentos.length === 0
                ? <Table.Tr>
                    <Table.Td>No hay documentos</Table.Td>
                </Table.Tr>
                : props.documentos.map(documento => {
                    if (!documento.content) {
                        return;
                    }

                    const differenceInMonths = moment(documento.validez).diff(moment.now(), 'months');
                    const differenceInDays = moment(documento.validez).diff(moment.now(), 'days');
                    let dateColor = "green";
                    if (differenceInMonths <= 0 && differenceInDays < 0) {
                        dateColor = "red";
                    } else if (differenceInMonths <= 1) {
                        dateColor = "yellow";
                    }

                    return (
                        <>
                            <Table.Tr key={documento.id} bg={dateColor}>
                                <Table.Td w="fit-content">
                                    <Button
                                        variant="default"
                                        maw="95%"
                                        onClick={() => downloadDocumento(documento)}
                                        w="100%"
                                    >
                                        {documento.docNombre}
                                    </Button>
                                </Table.Td>
                                <Table.Td>
                                    {moment(documento.validez).format("DD-MM-YYYY")}
                                </Table.Td>
                                <Table.Td
                                    align="right"
                                    pr="15px"
                                >
                                    <ActionIcon
                                        aria-label="Settings"
                                        bg="red"
                                        color="white"
                                        onClick={() => openDeleteDocumentModal(documento)}
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
                            <DeleteDocumentoModal
                                opened={deleteDocumentoModalIsOpen}
                                close={closeDeleteDocumentoModal}
                                deleteDocumento={deleteDocumento}
                                nombreDocumento={documento.docNombre}
                            />
                        </>
                    );
                })
        }
    </Table.Tbody>
}

function DeleteDocumentoModal(props: Readonly<{
    opened: boolean,
    close: VoidFunction,
    deleteDocumento: VoidFunction,
    nombreDocumento: string,
}>) {
    return (
        <Modal onClose={props.close} opened={props.opened} title="Eliminar documento">
            <Text>¿Desea eliminar el documento {props.nombreDocumento}?</Text>
            <Space h="15px"/>
            <Flex>
                <Button onClick={props.deleteDocumento} variant="default">Eliminar</Button>
                <Space w="15px"/>
                <Button onClick={props.close} bg="#74b49b">Cancelar</Button>
            </Flex>
        </Modal>
    );
}

function DocumentosModal(props: Readonly<{
    opened: boolean,
    close: VoidFunction,
    documentos: Documento[],
    setDocumentos: Function
}>) {
    const [fileToUpload, setFileToUpload] = useState(null as File | null);
    const [checkForErrors, setCheckForErrors] = useState(false);
    const [dateInputValue, setDateInputValue] = useState("" as string);
    const [submitButtonIsDisabled, setSubmitButtonIsDisabled] = useState(false);
    const fileInputError = checkForErrors && !fileToUpload && "Debe elegir un archivo";
    const dateInputError = checkForErrors && !dateInputValue && "Debe seleccionar una fecha de vencimiento";

    function handleOnDateInputChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.currentTarget) {
            setDateInputValue(event.currentTarget.value);
        }
    }

    function handleOnFilesChange(file: File | null) {
        if (file !== null) {
            setFileToUpload(file);
        }
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        setCheckForErrors(true);
        if (!fileToUpload || !dateInputValue) {
            return;
        }
        setSubmitButtonIsDisabled(true); /* Importante para evitar que multiples clicks suban archivos repetidos */
        const formData = new FormData();
        const fileData = {
            fechaDeSubida: new Date(),
            docNombre: fileToUpload.name,
            validez: dateInputValue,
            idPersonal: idPersonal,
        }
        formData.append('fileProperties', JSON.stringify(fileData));
        formData.append('file', fileToUpload);
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/upload`, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    close();
                    return;
                }
                if (response.status === 404) {
                    notifications.show({
                        color: "red",
                        message: "No hay conexión con el servidor",
                    });
                    return;
                }
                notifications.show({
                    color: "red",
                    message: "Error al subir el archivo",
                });
            })
            .catch(error => {
                notifications.show({
                    color: "red",
                    message: "Error al subir el archivo",
                });
                console.error('Error en la solicitud:', error);
            })
            .finally(() => {
                setSubmitButtonIsDisabled(false);
            });
    }

    function close() {
        props.close();
        setTimeout(() => { /* para que no se vea como se borran los datos antes de que se cierre el modal */
            setFileToUpload(null);
            setDateInputValue("");
            setCheckForErrors(false);
        }, 100);
        window.location.reload(); /* para triggerear la precarga de datos nuevamente */
    }

    return <Modal onClose={close} opened={props.opened} title="Agregar documentos">
        <form onSubmit={onSubmit}>
            <FileButton
                accept="application/pdf"
                onChange={handleOnFilesChange}
            >
                {
                    (props) => <Button
                        {...props}
                        size="xs"
                        type="button"
                        variant="default"
                    >
                        Seleccionar documento
                    </Button>
                }
            </FileButton>
            {
                fileToUpload
                    ? <small style={{display: "block", padding: "5px 0 0 5px"}}>
                        Archivo a subir: {fileToUpload.name}
                    </small>
                    : <small style={{color: "red", display: "block", font: "12px Inter", padding: "5px 0 0 5px"}}>
                        {fileInputError}
                    </small>
            }
            <Space h="15px"/>
            <TextInput
                error={dateInputError}
                label="Fecha de Nacimiento"
                onChange={(event) => handleOnDateInputChange(event)}
                type="date"
                value={dateInputValue}
            />
            <Space h="15px"/>
            <Button
                disabled={submitButtonIsDisabled}
                fullWidth
                type="submit"
                bg="#74b49b"
            >
                Guardar documento
            </Button>
        </form>
    </Modal>
}