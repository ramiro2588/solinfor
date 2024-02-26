import "./ConfirmarDescartarModal.scss";
import {Button, Group, Modal, Paper} from "@mantine/core";

export default function ConfirmarDescartarModal(props: Readonly<{
    open: boolean,
    close: () => void,
    onConfirm: () => void,
}>) {
    return (
        <Modal
            opened={props.open}
            onClose={props.close}
            title="Confirmar acción"
        >
            <Paper>
                ¿Desea descartar los cambios?
                <Group mt="25px">
                    <Button
                        onClick={props.close}
                        c="white"
                        bg="grey"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            props.close();
                            props.onConfirm();
                        }} c="white" bg="red"
                    >
                        Descartar
                    </Button>
                </Group>
            </Paper>
        </Modal>
    );
}