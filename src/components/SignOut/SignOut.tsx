import "./SignOut.scss";
import {useContext, useEffect} from "react";
import {Center} from "@mantine/core";
import {AuthContext} from "../Global/Account/RequireAuthentication";

export default function SignOut() {
    const {logout} = useContext(AuthContext);
    useEffect(() => {
        logout();
    }, [])

    return (<Center bg="#d9d9d9"/>);
}