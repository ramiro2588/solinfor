import {AuthContext} from "../Account/RequireAuthentication";
import {useContext, useEffect, useState} from "react";
import Unauthorized from "../Unauthorized/Unauthorized";
import {Outlet} from "react-router-dom";

export default function RequirePermissions(props: Readonly<{ requiredPermissions: string[] }>) {
    const {currentUser} = useContext(AuthContext);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (props.requiredPermissions.every(permission => currentUser?.role?.permissions.includes(permission))) {
            setIsAuthorized(true);
        }
    }, []);

    return (
        isAuthorized
            ? <Outlet/>
            : <Unauthorized/>
    );
}