import {Center, Loader} from "@mantine/core";
import {ReactElement} from "react";

export default function CustomLoader(props: { children: ReactElement, isLoading: boolean }) {
    return (
        props.isLoading
            ? <Center w={'100%'} h="100dvh" bg="#5c8d89">
                <Loader color="#ffffff" size="xl"/>
            </Center>
            : props.children
    );
}