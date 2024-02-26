import "./DeleteUsers.scss";
import {Paper, PaperProps, Table} from "@mantine/core";
import {useEffect, useState} from "react";
import CustomLoader from "../Global/Loader/CustomLoader";

export default function DeleteUsers(props: Readonly<{ mantine?: PaperProps }>) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {}, []);

    const rows = [{name: "name1", position: "position1", symbol: "symbol1", mass: "mass1"}].map((element) => (
        <Table.Tr key={element.name}>
            <Table.Td>{element.position}</Table.Td>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td>{element.symbol}</Table.Td>
            <Table.Td>{element.mass}</Table.Td>
        </Table.Tr>
    ));

    return <CustomLoader isLoading={isLoading}>
        <Paper
            bg={props.mantine?.bg}
            mih="100dvh"
            w="100%"
        >
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Element position</Table.Th>
                        <Table.Th>Element name</Table.Th>
                        <Table.Th>Symbol</Table.Th>
                        <Table.Th>Atomic mass</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Paper>
    </CustomLoader>
}