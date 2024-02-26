export default interface LoginResponse {
    id: number,
    username: string,
    email: string,
    name: string,
    client: string,
    role?: {
        id: number,
        name: string,
        permissions: string[]
    },
    must_update_password: boolean
}