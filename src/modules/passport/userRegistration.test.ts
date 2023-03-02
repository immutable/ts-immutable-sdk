import axios from "axios";
import {PassportUserRegistrationRequest, registerPassportUser} from './userRegistration';

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('registerPassportUser', () => {
    it('resister passport user successfully data from an API', async () => {
        const requestBody: PassportUserRegistrationRequest = {
            eth_signature: "0x232",
            ether_key: "0x123",
            stark_key: "0x232",
            stark_signature: "0x232",
        };
        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
        const response = {
            status: 204
        };
        mockedAxios.post.mockImplementationOnce(() => Promise.resolve(response));

        const res = await registerPassportUser(requestBody, mockToken);

        expect(res).toEqual(204)
    });

    it('resister passport user failed from an API', async () => {
        const requestBody: PassportUserRegistrationRequest = {
            eth_signature: "0x232",
            ether_key: "0x123",
            stark_key: "0x232",
            stark_signature: "0x232",
        };
        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
        const response = {
            status: 500
        };
        mockedAxios.post.mockImplementationOnce(() => Promise.reject(response));

        await expect(registerPassportUser(requestBody, mockToken))
            .rejects
            .toThrow('USER_REGISTRATION_ERROR');
    });
});
