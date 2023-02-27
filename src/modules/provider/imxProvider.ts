import { RegisterUserResponse } from "src/types";

export interface IMXProvider {
    registerOffchain():Promise<RegisterUserResponse>;
}
