import axios, { type AxiosInstance } from 'axios';
import { Donation } from 'types/types';
import { DonationItem } from 'types/types';

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

  private async post(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .post(path, body)
      .then((response) => response.data);
  }

  public async postDonation(body: unknown): Promise<Donation> {
    return this.post('/api/donations/create', body) as Promise<Donation>;
  }

  public async postDonationItem(body: unknown): Promise<DonationItem> {
    return this.post(
      '/api/donation-items/create',
      body,
    ) as Promise<DonationItem>;
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
