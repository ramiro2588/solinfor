import {useContext} from "react";
import {AuthContext} from "../Global/Account/RequireAuthentication";
import {Permiso} from "../../interfaces/dominio";
import {useNavigate} from "react-router-dom";
import CustomLoader from "../Global/Loader/CustomLoader";

export default function MainRedirect() {
    const navigate = useNavigate();
    const {currentUser} = useContext(AuthContext);
    const userPermissions = currentUser?.role?.permissions;
    const canReadActividades = !!userPermissions?.includes(Permiso.LEER_ACTIVIDAD);
    return (
        <CustomLoader isLoading={true}>
            <>
                {
                    canReadActividades
                        ? navigate(process.env.REACT_APP_SOLINFOR_ROUTE_ACTIVIDADES!)
                        : navigate(process.env.REACT_APP_SOLINFOR_ROUTE_PERSONAL!)
                }
            </>
        </CustomLoader>
    );
}