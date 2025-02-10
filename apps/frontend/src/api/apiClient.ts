import axios, { type AxiosInstance } from 'axios';
import { Pantry } from 'types/types';
import { User } from 'types/types';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: defaultBaseUrl });
  }

  public async getHello(): Promise<string> {
    return this.get('/api') as Promise<string>;
  }

  private async get(path: string): Promise<unknown> {
    return this.axiosInstance.get(path).then((response) => response.data);
  }

  public async getPantry(pantryId: number): Promise<Pantry> {
    return this.get(`/api/pantries/${pantryId}`) as Promise<Pantry>;
  }

  public async getPantrySSFRep(pantryId: number): Promise<User> {
    return this.get(`/api/pantries/${pantryId}/ssf-contact`) as Promise<User>;
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .post(path, body)
      .then((response) => response.data);
  }

  private async patch(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .patch(path, body)
      .then((response) => response.data);
  }

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }
}

export default new ApiClient();
