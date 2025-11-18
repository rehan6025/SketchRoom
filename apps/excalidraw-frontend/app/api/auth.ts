import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function loginUser(email: string, password: string) {
    try {
        const res = await axios.post(`${HTTP_BACKEND}/signin`, {
            username: email,
            password,
        });

        const token = res.data.token;

        return token;
    } catch (error) {
        console.log("api :: loginuser ::", error);
    }
}

export async function signupUser(
    name: string,
    email: string,
    password: string
) {
    try {
        const res = await axios.post(`${HTTP_BACKEND}/signup`, {
            username: email,
            password,
            name,
        });

        return res.data.token;
    } catch (error) {
        console.log("api :: signupUser ::", error);
    }
}
