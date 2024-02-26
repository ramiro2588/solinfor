import "./SignIn.scss";
import SignInForm from "./SignInForm/SignInForm";
import {Center, Image, PaperProps, Title} from "@mantine/core";
import solinforLogo from "../../resources/img/solinfor_logo.png"
import ChangePasswordForm from "./ChangePasswordForm/ChangePasswordForm";
import {useState} from "react";
import CustomLoader from "../Global/Loader/CustomLoader";

export default function SignIn(props: Readonly<{ mantine: PaperProps, changePassword?: boolean }>) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <CustomLoader isLoading={isLoading}>
            <Center
                w='100%'
                bg={props.mantine.bg}
                className="sign-in"
                h="100dvh"
            >
                <Center
                    className="sign-in__logo"
                    m="auto"
                    display="block"
                >
                    <Center>
                        <Image
                            mb="lg"
                            src={solinforLogo}
                            w="100px"
                            draggable={false}
                        />
                    </Center>
                    <Title
                        c="#ffffff"
                        mb="xl"
                        order={1}
                        className="sign-in__logo__title"
                    >
                        SOLINFOR
                    </Title>
                    {
                        props.changePassword
                            ? <ChangePasswordForm mantine={{bg: "#d9d9d9"}} setIsLoading={setIsLoading}/>
                            : <SignInForm mantine={{bg: "#d9d9d9"}} setIsLoading={setIsLoading}/>
                    }
                </Center>
            </Center>
        </CustomLoader>
    );
}