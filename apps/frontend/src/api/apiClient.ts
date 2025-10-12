import axios, { type AxiosInstance } from 'axios';
import {
  User,
  Pantry,
  Order,
  FoodRequest,
  FoodManufacturer,
  DonationItem,
  Donation,
  Allocation,
} from 'types/types';

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

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }

  public async getRepresentativeUser(userId: number): Promise<User> {
    return this.axiosInstance
      .get(`/api/users/${userId}`)
      .then((response) => response.data);
  }

  public async getPantrySSFRep(pantryId: number): Promise<User> {
    return this.get(`/api/pantries/${pantryId}/ssf-contact`) as Promise<User>;
  }

  public async getAllPendingPantries(): Promise<Pantry[]> {
    return this.axiosInstance
      .get('/api/pantries/pending')
      .then((response) => response.data);
  }

  public async getPantryFromOrder(orderId: number): Promise<Pantry | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/pantry`)
      .then((response) => response.data);
  }

  public async getPantry(pantryId: number): Promise<Pantry> {
    return this.get(`/api/pantries/${pantryId}`) as Promise<Pantry>;
  }

  public async getFoodRequestFromOrder(
    orderId: number,
  ): Promise<FoodRequest | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/request`)
      .then((response) => response.data);
  }

  public async getOrderFoodRequest(requestId: number): Promise<FoodRequest> {
    return this.get(`/api/requests/${requestId}`) as Promise<FoodRequest>;
  }

  public async getDonationFromOrder(orderId: number): Promise<Donation | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/donation`)
      .then((response) => response.data);
  }

  public async getOrderDonation(donationId: number): Promise<Donation> {
    return this.get(`/api/donations/${donationId}`) as Promise<Donation>;
  }

  public async getDonationItemsByDonationId(
    donationId: number,
  ): Promise<DonationItem[]> {
    return this.get(
      `/api/donation-items/get-donation-items/${donationId}`,
    ) as Promise<DonationItem[]>;
  }

  public async getManufacturerFromOrder(
    orderId: number,
  ): Promise<FoodManufacturer | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/manufacturer`)
      .then((response) => response.data);
  }

  public async getAllOrders(): Promise<Order[]> {
    return this.axiosInstance
      .get('/api/orders/orders')
      .then((response) => response.data);
  }

  public async getCurrentOrders(): Promise<Order[]> {
    return this.axiosInstance
      .get('/api/orders/get-current-orders')
      .then((response) => response.data);
  }

  public async getPastOrders(): Promise<Order[]> {
    return this.axiosInstance
      .get('/api/orders/get-past-orders')
      .then((response) => response.data);
  }

  public async getOrder(orderId: number): Promise<Order> {
    return this.axiosInstance.get(`api/orders/${orderId}`) as Promise<Order>;
  }

  public async getOrderByRequestId(requestId: number): Promise<Order> {
    return this.axiosInstance.get(
      `api/requests/get-order/${requestId}`,
    ) as Promise<Order>;
  }

  async getAllAllocationsByOrder(orderId: number): Promise<Allocation[]> {
    return this.axiosInstance
      .get(`api/orders/${orderId}/allocations`)
      .then((response) => response.data);
  }

  public async updateOrderStatus(
    orderId: number,
    newStatus: 'shipped' | 'delivered',
  ): Promise<void> {
    await this.axiosInstance.patch(`/api/orders/update-status/${orderId}`, {
      orderId,
      newStatus,
    });
  }

  public async updatePantry(
    pantryId: number,
    decision: 'approve' | 'deny',
  ): Promise<void> {
    await this.axiosInstance.post(`/api/pantries/${decision}/${pantryId}`, {
      pantryId,
    });
  }

  public async getPantryRequests(pantryId: number): Promise<FoodRequest[]> {
    const data = await this.get(`/api/requests/get-all-requests/${pantryId}`);
    console.log('Raw response from API:', data);
    return data as FoodRequest[];
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
}

export default new ApiClient();
