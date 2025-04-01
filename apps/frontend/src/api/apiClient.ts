import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { Donation, DonationItem, User, Pantry, FoodRequest } from 'types/types';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | undefined;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: defaultBaseUrl });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.accessToken || localStorage.getItem('accessToken');
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 403) {
          window.location.replace('/unauthorized');
        }
        return Promise.reject(error);
      },
    );
  }

  public setAccessToken(token: string | undefined) {
    this.accessToken = token;
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

  public async getPantryRequests(pantryId: number): Promise<FoodRequest[]> {
    try {
      const response = await this.axiosInstance.get(
        `/api/requests/${pantryId}`,
      );
      return response.data;
    } catch (error) {
      alert('Error fetching food requests: ' + error);
      return [];
    }
  }

  public async confirmDelivery(
    requestId: number,
    data: FormData,
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.post(
        `/api/requests/${requestId}/confirm-delivery`,
        data,
      );

      if (response.status === 200) {
        alert('Delivery confirmation submitted successfully');
        window.location.href = '/request-form/1';
      } else {
        alert(`Failed to submit: ${response.statusText}`);
      }
    } catch (error) {
      alert(`Error submitting delivery confirmation: ${error}`);
    }
  }

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }
}

export default new ApiClient();
