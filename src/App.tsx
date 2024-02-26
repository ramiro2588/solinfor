import './App.scss';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import {createTheme, Flex, MantineProvider} from "@mantine/core";
import SignIn from "./components/SignIn/SignIn";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignOut from "./components/SignOut/SignOut";
import SettingsView from './components/SettingsView/SettingsView';
import NavbarComponent from './components/Navbar/NavbarComponent';
import {useMediaQuery} from '@mantine/hooks';
import AgregarActividad from "./components/Actividad/AgregarActividad";
import RequireAuthentication from "./components/Global/Account/RequireAuthentication";
import PostProducto from './components/Producto/PostProducto/PostProducto';
import NotFound from "./components/Global/NotFound/NotFound";
import {Notifications} from '@mantine/notifications';
import VerActividades from './components/Actividad/VerActividades/VerActividades';
import VerPersonal from './components/Personal/VerPersonal/VerPersonal';
import EditarPersonal from './components/Personal/EditarPersonal/EditarPersonal';
import Audits from './components/Audits/Audits';
import {VerProductos} from './components/Producto/VerProductos/VerProductos';
import DeleteUsers from "./components/DeleteUsers/DeleteUsers";
import VerUsuarios from './components/Usuario/VerUsuarios';
import RegisterUsers from "./components/RegisterUser/RegisterUser";
import AltaPersonal from './components/Personal/AltaPersonal/AltaPersonal';
import EditarUsuario from './components/Usuario/EditarUsuario/EditarUsuario';
import MainRedirect from "./components/MainPageBorrar/MainRedirect";
import RequirePermissions from "./components/Global/RequirePermissions/RequirePermissions";
import {Permiso} from "./interfaces/dominio";

const theme = createTheme({
    fontFamily: "Inter",
    colors: {
        "solinforgreen": ["#5c8d89"] as any,
        "solinforgrey": ["#D9D9D9"] as any,
    }
});

export default function App() {
    const matches = useMediaQuery('(max-width: 900px)');

    return (
        <MantineProvider theme={theme}>
            <Notifications/>
            <BrowserRouter>
                <Flex direction={matches ? 'column' : 'row'}>
                    <Routes>
                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_IN}
                               element={<SignIn mantine={{bg: theme.colors?.solinforgreen![0]}}/>}/>
                        <Route path={`${process.env.REACT_APP_SOLINFOR_ROUTE_CHANGE_PASSWORD}/:username`}
                               element={<SignIn mantine={{bg: theme.colors?.solinforgreen![0]}} changePassword/>}/>
                        <Route element={<RequireAuthentication/>}>
                            <Route element={<NavbarComponent/>}>
                                <Route path="*" element={<NotFound/>}/>
                                <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_MAIN}
                                       element={<MainRedirect/>}/>
                                <Route element={<RequirePermissions requiredPermissions={[Permiso.EDITAR_AJUSTES]}/>}>
                                    <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_SETTINGS}
                                           element={<SettingsView/>}/>
                                </Route>

                                {/* rutas de actividades */}
                                <Route element={<RequirePermissions requiredPermissions={[Permiso.LEER_ACTIVIDAD]}/>}>
                                    <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES}
                                           element={<VerActividades mantine={{bg: theme.colors?.solinforgreen![0]}}/>}/>
                                    <Route element={<RequirePermissions
                                        requiredPermissions={[Permiso.AGREGAR_ACTIVIDAD]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES_AGREGAR}
                                               element={<AgregarActividad
                                                   mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    </Route>
                                </Route>

                                {/* rutas de producto */}
                                <Route element={<RequirePermissions requiredPermissions={[Permiso.LEER_PRODUCTOS]}/>}>
                                    <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_PRODUCTO}
                                           element={<VerProductos/>}/>
                                    <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_AUDITS}
                                           element={<Audits mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    <Route element={<RequirePermissions
                                        requiredPermissions={[Permiso.AGREGAR_PRODUCTO]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_POST_PRODUCTO}
                                               element={<PostProducto/>}/>
                                    </Route>
                                </Route>

                                {/* rutas de personal */}
                                <Route element={<RequirePermissions requiredPermissions={[Permiso.LEER_PERSONAL]}/>}>
                                    <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL}
                                           element={<VerPersonal mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    <Route element={<RequirePermissions
                                        requiredPermissions={[Permiso.AGREGAR_PERSONAL]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL_AGREGAR}
                                               element={<AltaPersonal
                                                   mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    </Route>
                                    <Route
                                        element={<RequirePermissions requiredPermissions={[Permiso.EDITAR_PERSONAL]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL_EDITAR}
                                               element={<EditarPersonal
                                                   mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    </Route>
                                </Route>

                                {/* rutas de usuario */}
                                <Route element={<RequirePermissions requiredPermissions={[Permiso.LEER_USUARIOS]}/>}>
                                    <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_USERS}
                                           element={<VerUsuarios mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    <Route
                                        element={<RequirePermissions requiredPermissions={[Permiso.CREAR_USUARIOS]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_USERS_REGISTER}
                                               element={<RegisterUsers
                                                   mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    </Route>
                                    <Route
                                        element={<RequirePermissions requiredPermissions={[Permiso.EDITAR_USUARIO]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_USERS_EDITAR}
                                               element={<EditarUsuario
                                                   mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    </Route>

                                    <Route element={<RequirePermissions
                                        requiredPermissions={[Permiso.DAR_BAJA_USUARIOS]}/>}>
                                        <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_USERS_DELETE}
                                               element={<DeleteUsers mantine={{bg: theme.colors?.solinforgrey![0]}}/>}/>
                                    </Route>
                                </Route>
                            </Route>
                            <Route path={process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_OUT}
                                   element={<SignOut/>}/>
                        </Route>
                    </Routes>
                </Flex>
            </BrowserRouter>
        </MantineProvider>
    );
}