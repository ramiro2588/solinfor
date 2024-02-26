import {createContext, useEffect, useMemo, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import CustomLoader from "../Loader/CustomLoader";
import ValidateSessionResponse from "../../../interfaces/ValidateSessionResponse";
import LoginResponse from "../../../interfaces/LoginResponse";

const AuthContext = createContext({} as { currentUser: LoginResponse | undefined, logout: Function });

export default function RequireAuthentication() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState({} as LoginResponse | undefined);
    const authContextValue = useMemo(() => ({currentUser, logout}),
        [currentUser, logout]
    );

    function logout() {
        setCurrentUser(undefined);
        fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/api/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
        }).then(() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_IN!));
    }

    function fetchValidateSession() {
        return fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/api/validateSession`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
        })
    }

    async function fetchRefreshToken() {
        return fetch(`${process.env.REACT_APP_SOLINFOR_BACKEND_ROUTE}/api/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
        })
    }

    function validateSession() {
        fetchValidateSession()
            .then(async (response) => {
                if (response.status === 401) {
                    await fetchRefreshToken()
                        .then(response => {
                            if (response?.status === 401 || response?.status === 403) {
                                navigate(process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_IN!);
                                return;
                            }
                            fetchValidateSession()
                                .then(response => response.json())
                                .then((response: ValidateSessionResponse) => {
                                    setCurrentUser(response.payload);
                                })
                                .catch(() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_IN!))
                                .finally(() => setIsLoading(false))
                        })
                }
                return response.json();
            })
            .then((response: ValidateSessionResponse) => {
                setCurrentUser(response.payload);
            })
            .catch(() => navigate(process.env.REACT_APP_SOLINFOR_ROUTE_SIGN_IN!))
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        validateSession();
    }, []);

    return (
        <CustomLoader isLoading={isLoading}>
            <AuthContext.Provider value={authContextValue}>
                <Outlet/>
            </AuthContext.Provider>
        </CustomLoader>
    );
}

export {RequireAuthentication, AuthContext}