import LoginResponse from "./LoginResponse";

export default interface ValidateSessionResponse {
    payload: LoginResponse,
    iat: number,
    exp: number,
}