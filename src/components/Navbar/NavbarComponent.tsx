import {Badge, Button, Center, Flex, Image, Title} from "@mantine/core";
import {
    CubeIcon,
    ExitIcon,
    GearIcon,
    HamburgerMenuIcon,
    IdCardIcon,
    PersonIcon,
    RocketIcon
} from "@radix-ui/react-icons";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import './NavbarComponent.scss'
import {useContext, useEffect, useState} from "react";
import {useMediaQuery} from "@mantine/hooks";
import solinforLogo from "../../resources/img/solinfor_logo.png";
import {AuthContext} from "../Global/Account/RequireAuthentication";
import {Permiso} from "../../interfaces/dominio";

const routes = {
    ajustes: process.env.REACT_APP_SOLINFOR_ROUTE_SETTINGS,
    actividades: process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES,
    producto: process.env.REACT_APP_SOLINFOR_ROUTE_PRODUCTO,
    personal: process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL,
    usuario: process.env.REACT_APP_SOLINFOR_ROUTE_USERS
}

export default function NavbarComponent() {
    const navigate = useNavigate();
    const [active, setActive] = useState('');
    const [show, setShow] = useState(false);
    const {currentUser} = useContext(AuthContext);
    const firstLocation = useLocation().pathname.substring(1);

    const matches = useMediaQuery('(max-width: 900px)');

    useEffect(() => {
        setActive(firstLocation.charAt(0).toUpperCase() + firstLocation.slice(1))
    }, []);

    const data = [
        {link: routes.actividades, label: 'Actividades', icon: RocketIcon, requiredPermission: Permiso.LEER_ACTIVIDAD},
        {link: routes.producto, label: 'Productos', icon: CubeIcon, requiredPermission: Permiso.LEER_PRODUCTOS},
        {link: routes.personal, label: 'Personal', icon: IdCardIcon, requiredPermission: Permiso.LEER_PERSONAL},
        {link: routes.usuario, label: 'Usuarios', icon: PersonIcon, requiredPermission: Permiso.LEER_USUARIOS},
        {link: routes.ajustes, label: 'Ajustes', icon: GearIcon, requiredPermission: Permiso.EDITAR_AJUSTES}
    ];


    const links = data
        .filter(link => currentUser?.role?.permissions.includes(link.requiredPermission))
        .map((item) => (
            <a
                className={'link'}
                data-active={item.label === active || undefined}
                href={item.link}
                key={item.label}
                onClick={(event) => {
                    event.preventDefault();
                    setActive(item.label);
                    navigate(item.link as string)
                }}
            >
                <item.icon className={'linkIcon'}/>
                <span>{item.label}</span>
            </a>
        ));

    const logo = (
        <Center className="sign-in">
            <Center className="sign-in__logo" m="auto" display="block">
                <Center>
                    {matches ? <Image src={solinforLogo} w="80px" draggable={false}/> :
                        <Image mt={'lg'} mb="lg" src={solinforLogo} w="80px" draggable={false}/>}
                </Center>
                {matches ? '' : <Title c="#ffffff" mb="xl" order={1} className="sign-in__logo__title">SOLINFOR</Title>}
            </Center>
        </Center>
    );

    const phoneNav = (
        <Flex className="sticky z_index" p={'lg'} w={'100%'} bg={'rgba(116, 180, 155, 1)'} direction={"column"}
              align={'center'}>
            <Flex w={'100%'} align={'center'} justify={'space-between'}>
                {logo}
                <Badge color="#5c8d89">{currentUser?.name}</Badge>
                <Button p={0} miw={'40px'} bg={'white'} onClick={() => setShow(!show)}>
                    <HamburgerMenuIcon color="rgba(116, 180, 155, 1)" className="menuIcon"></HamburgerMenuIcon>
                </Button>
            </Flex>
            {
                show ?
                    (<>
                        <Flex w={'100%'} direction={'column'} mt={'20px'}>
                            {links}
                        </Flex>
                        <Flex w={'100%'} direction={'column'} mt={'20px'} className="signOut">
                            <a
                                className={'link'}
                                href={process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_OUT}
                                key={'Cerrar Sesión'}
                                onClick={(event) => {
                                    event.preventDefault();
                                    setActive('Cerrar Sesión');
                                    navigate(process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_OUT!)
                                }}
                            >
                                <ExitIcon className={'linkIcon'}/>
                                <span>{'Cerrar Sesión'}</span>
                            </a>
                        </Flex>
                    </>)
                    : ''
            }
        </Flex>
    );

    const nav = (
        <Flex className="sticky" w={'300px'} miw={'250px'} h={'100%'} mih={'100vh'} bg={'rgba(116, 180, 155, 1)'}
              justify={'space-between'} direction={'column'}>
            <Flex w={'100%'} align={'center'} direction={'column'}>
                {logo}
                <Badge color="#5c8d89">{currentUser?.name}</Badge>
                <Flex w={'100%'} direction={'column'} mt={'20px'}>
                    {links}
                </Flex>
            </Flex>
            <Flex w={'100%'} direction={'column'} mt={'20px'} className="signOut">
                <a
                    className={'link'}
                    href={process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_OUT}
                    key={'Cerrar Sesión'}
                    onClick={(event) => {
                        event.preventDefault();
                        setActive('Cerrar Sesión');
                        navigate(process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_OUT!)
                    }}
                >
                    <ExitIcon className={'linkIcon'}/>
                    <span>{'Cerrar Sesión'}</span>
                </a>
            </Flex>
        </Flex>
    )

    return <>{(matches ? phoneNav : nav)}<Outlet/></>
}