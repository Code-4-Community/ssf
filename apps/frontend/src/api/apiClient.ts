import axios, { type AxiosInstance, AxiosResponse } from 'axios';
import { Donation, DonationItem, User, Pantry } from 'types/types';
import { PantryApplicationDto } from '@api/types';

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

  public async get(path: string): Promise<unknown> {
    return this.axiosInstance.get(path).then((response) => response.data);
  }

  public async getRepresentativeUser(userId: number): Promise<User> {
    return this.axiosInstance
      .get(`/api/users/${userId}`)
      .then((response) => response.data);
  }

  public async getAllPendingPantries(): Promise<Pantry[]> {
    return this.axiosInstance
      .get('/api/pantries/pending')
      .then((response) => response.data);
  }

  public async updatePantry(
    pantryId: number,
    decision: 'approve' | 'deny',
  ): Promise<void> {
    await this.axiosInstance.post(`/api/pantries/${decision}/${pantryId}`, {
      pantryId,
    });
  }

  public async getPantry(pantryId: number): Promise<Pantry> {
    return this.get(`/api/pantries/${pantryId}`) as Promise<Pantry>;
  }

  public async getPantrySSFRep(pantryId: number): Promise<User> {
    return this.get(`/api/pantries/${pantryId}/ssf-contact`) as Promise<User>;
  }

  public async postPantry(
    data: PantryApplicationDto,
  ): Promise<AxiosResponse<void>> {
    return this.axiosInstance.post(`/api/pantries`, data);
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

  public async fulfillDonation(
    donationId: number,
    body?: unknown,
  ): Promise<Donation> {
    return this.patch(
      `/api/donations/${donationId}/fulfill`,
      body,
    ) as Promise<Donation>;
  }

  public async updateDonationItemQuantity(
    itemId: number,
    body?: unknown,
  ): Promise<DonationItem> {
    return this.patch(
      `/api/donation-items/update-quantity/${itemId}`,
      body,
    ) as Promise<DonationItem>;
  }

  public async getDonationItemsByDonationId(
    donationId: number,
  ): Promise<DonationItem[]> {
    return this.get(
      `/api/donation-items/get-donation-items/${donationId}`,
    ) as Promise<DonationItem[]>;
  }

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }
}

export default new ApiClient();
