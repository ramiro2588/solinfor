import {Button, Card, Container, Flex, PaperProps, Stack, Title} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import CustomLoader from "../Global/Loader/CustomLoader";
import {useEffect, useState} from "react";
import {Usuario} from "../../interfaces/dominio";
import {useMediaQuery} from "@mantine/hooks";
import "./VerUsuarios.scss"
import {ActividadMasterdata} from "../../classes/ActividadMasterdata";
import {Pencil2Icon} from "@radix-ui/react-icons";
import Capitalize from "../../utils/Capitalize";

export default function VerUsuarios(props: Readonly<{ mantine: PaperProps }>) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const matches = useMediaQuery('(min-width: 900px)');

    const [usuarios, setUsuarios] = useState([] as Usuario[]);
    const [roles, setRoles] = useState([] as ActividadMasterdata[]);

    useEffect(() => {
        setLoading(true);

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/user`, {
            method: "GET",
            credentials: "include",
        })
            .then(resp => resp.json())
            .then(data => setUsuarios(data as Usuario[]))
            .catch(err => console.log(err))

        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/masterdata/role`, {
            method: "GET",
            credentials: "include",
        })
            .then(resp => resp.json())
            .then(data => setRoles(data))
            .then(() => setLoading(false))
            .catch(err => console.log(err))
    }, []);

    const nombreRol = (id: number): string => {
        const rol = roles.find(rol => rol.id === id);
        return rol ? Capitalize(rol.nombre) : '';
    }


    const items = usuarios.map((usuario: Usuario) => {
        return <Card key={usuario.id} mb={'sm'} p={matches ? "md" : "xs"}>
            <Flex align={'center'} justify={'space-between'}>
                <b>{usuario.username}</b>
                <p>{nombreRol(usuario.role)}</p>
                <Button className={"edit-button"} rightSection={<Pencil2Icon/>} size={matches ? "md" : "sm"}
                        onClick={() => {
                            const ruta = process.env.REACT_APP_SOLINFOR_ROUTE_USERS_EDITAR!;
                            let rutaConId: any = ruta.split('/');
                            rutaConId.pop()
                            rutaConId.push(`${usuario.id}`)
                            rutaConId = rutaConId.join('/')
                            navigate(`${rutaConId}`)
                        }}>Editar</Button>
            </Flex>
        </Card>

    })

    return (
        <CustomLoader isLoading={loading}>
            <Container fluid w={"100%"} p={0} className={"container-ver-usuarios"}>
                <Stack bg={props.mantine.bg} w={'100%'} p={'lg'} mih={"100vh"}>
                    <Flex align={'center'} justify={'space-between'}>
                        <Title order={1}>Usuarios</Title>
                        <Button size={matches ? "lg" : "sm"} color="#74B49B"
                                onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_USERS_REGISTER!)}>
                            Agregar usuario
                        </Button>
                    </Flex>
                    {items}
                </Stack>
            </Container>
        </CustomLoader>
    );
}