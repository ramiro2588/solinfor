import "./Unauthorized.scss";
import {Container} from "@mantine/core";

export default function Unauthorized() {
    return <Container id="not-found" w="100%" m="0">
        <h2>
            Ups,
        </h2>
        <p>
            No tienes autorización para acceder a {window.location.pathname}.
        </p>
        <p>
            Revisa que la URL sea correcta, o <a href={process.env.REACT_APP_SOLINFOR_ROUTE_MAIN}> regresa a la
            pantalla principal</a>.
        </p>
    </Container>
}