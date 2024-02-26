import {Badge, Button, Card, Flex, PaperProps, Stack, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import CustomLoader from "../../Global/Loader/CustomLoader";
import {Documento, Personal} from "../../../interfaces/dominio";
import {useNavigate} from "react-router";

export default function VerPersonal(props: Readonly<{ mantine: PaperProps }>) {
    const [personal, setPersonal] = useState([] as Personal[]);
    const [documentos, setDocumentos] = useState([] as Documento[]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        getPersonal().then(response => response.json()).then(json => setPersonal(json as Personal[]));
        getDocumentos().then(response => response.json()).then(json => setDocumentos(json ?? [] as Documento[]))
            .then(() => setLoading(false));
    }, []);

    function checkDocumentos(personalId: number) {
        const docs = documentos.filter(doc => doc.idPersonal == personalId);
        const today = new Date();
        if (docs.length > 0) {
            let valid = true;
            let cercaDeVencerse = false;
            docs.forEach(doc => {
                const validez = new Date(doc.validez);
                if (today > validez) {
                    valid = false;
                } else if (today <= validez && today > new Date(validez.setDate(validez.getDate() - 30))) {
                    cercaDeVencerse = true;
                }
            })
            if (!valid) {
                return <Badge color="red" p={'md'} mr={'20px'}>Vencido</Badge>
            } else if (cercaDeVencerse) {
                return <Badge color="yellow" p={'md'} mr={'20px'}>A renovar</Badge>
            } else {
                return <Badge color="green" p={'md'} mr={'20px'}>Al día</Badge>
            }
        } else {
            return <Badge color="green" p={'md'} mr={'20px'}>Al día</Badge>
        }
    }

    const items = personal.map((p: Personal) => {
        return <Card key={p.id} mb={'sm'}>
            <Flex align={'center'} justify={'space-between'}>
                <Flex direction={'column'}>
                    <b>{p.nombre}</b>
                    <p>Cédula: {p.cedula}</p>
                </Flex>
                <Flex align={'center'}>
                    {checkDocumentos(p.id)}
                    <Button onClick={() => {
                        const ruta = process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL_EDITAR!;
                        let rutaConId: any = ruta.split('/');
                        rutaConId.pop()
                        rutaConId.push(`${p.id}`)
                        rutaConId = rutaConId.join('/')
                        navigate(`${rutaConId}`)
                    }}>Editar</Button>
                </Flex>
            </Flex>
        </Card>
    })

    return (<CustomLoader isLoading={loading}>
        <Stack bg={props.mantine.bg} w={'100%'} p={'lg'}>
            <Flex align={'center'} justify={'space-between'}>
                <Title order={1}>Personal</Title>
                <Button color="#74B49B"
                        onClick={() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL_AGREGAR!)}>Agregar
                    personal</Button>
            </Flex>
            {items}
        </Stack>
    </CustomLoader>);
}


async function getPersonal() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}

async function getDocumentos() {
    return await fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/personal/documento`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    });
}

