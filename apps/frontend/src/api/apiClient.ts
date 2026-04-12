import { fetchAuthSession } from 'aws-amplify/auth';
import axios, {
  AxiosError,
  AxiosResponse,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { NavigateFunction } from 'react-router-dom';
import {
  User,
  Order,
  FoodRequest,
  FoodManufacturer,
  DonationItem,
  Donation,
  Allocation,
  CreateFoodRequestBody,
  Pantry,
  PantryApplicationDto,
  ManufacturerApplicationDto,
  OrderSummary,
  UserDto,
  OrderDetails,
  ConfirmDeliveryDto,
  OrderWithoutRelations,
  FoodRequestSummaryDto,
  OrderWithoutFoodManufacturer,
  PantryWithUser,
  Assignments,
  CreateDonationDto,
  UpdateProfileFields,
  DonationDetails,
} from 'types/types';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private navigate: NavigateFunction | null = null;

  public setNavigate(navigate: NavigateFunction): void {
    this.navigate = navigate;
  }

  constructor() {
    this.axiosInstance = axios.create({ baseURL: defaultBaseUrl });

    // Attach the access token to each request if available
    // All API requests will go through this interceptor, making the user required to login
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 403) {
          if (this.navigate) {
            this.navigate('/unauthorized');
          } else {
            window.location.replace('/unauthorized');
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public async get(path: string): Promise<unknown> {
    return this.axiosInstance.get(path).then((response) => response.data);
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .post(path, body)
      .then((response) => response.data);
  }

  public async postDonation(body: CreateDonationDto): Promise<Donation> {
    return this.post('/api/donations/', body) as Promise<Donation>;
  }

  public async createFoodRequest(
    body: CreateFoodRequestBody,
  ): Promise<FoodRequest> {
    return this.post('/api/requests/', body) as Promise<FoodRequest>;
  }

  private async patch(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .patch(path, body)
      .then((response) => response.data);
  }

  public async getAllDonations(): Promise<Donation[]> {
    return this.axiosInstance
      .get('/api/donations')
      .then((response) => response.data);
  }

  public async getAllDonationsByFoodManufacturer(
    foodManufacturerId: number,
  ): Promise<DonationDetails[]> {
    return this.axiosInstance
      .get(`/api/manufacturers/${foodManufacturerId}/donations`)
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

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }

  public async getRepresentativeUser(userId: number): Promise<User> {
    return this.axiosInstance
      .get(`/api/users/${userId}`)
      .then((response) => response.data);
  }

  public async postUser(data: UserDto): Promise<User> {
    return this.axiosInstance.post(`/api/users`, data);
  }

  public async getAllPendingPantries(): Promise<PantryWithUser[]> {
    return this.axiosInstance
      .get('/api/pantries/pending')
      .then((response) => response.data);
  }

  public async getAllPendingFoodManufacturers(): Promise<FoodManufacturer[]> {
    return this.axiosInstance
      .get('/api/manufacturers/pending')
      .then((response) => response.data);
  }

  public async getFoodManufacturer(
    manufacturerId: number,
  ): Promise<FoodManufacturer> {
    return this.get(
      `/api/manufacturers/${manufacturerId}`,
    ) as Promise<FoodManufacturer>;
  }

  public async getPantryFromOrder(orderId: number): Promise<Pantry | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/pantry`)
      .then((response) => response.data);
  }

  public async getPantryOrders(
    pantryId: number,
  ): Promise<OrderWithoutFoodManufacturer[]> {
    return this.axiosInstance
      .get(`/api/pantries/${pantryId}/orders`)
      .then((response) => response.data);
  }

  public async getPantry(pantryId: number): Promise<PantryWithUser> {
    return this.get(`/api/pantries/${pantryId}`) as Promise<PantryWithUser>;
  }

  public async postPantry(
    data: PantryApplicationDto,
  ): Promise<AxiosResponse<void>> {
    return this.axiosInstance.post(`/api/pantries`, data);
  }

  public async getFoodRequestFromOrder(
    orderId: number,
  ): Promise<FoodRequestSummaryDto | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/request`)
      .then((response) => response.data);
  }

  public async getVolunteers(): Promise<Assignments[]> {
    return this.get('/api/volunteers') as Promise<Assignments[]>;
  }

  public async getVolunteerPantries(userId: number): Promise<Pantry[]> {
    return this.get(`/api/volunteers/${userId}/pantries`) as Promise<Pantry[]>;
  }

  public async updateUser(
    userId: number,
    fields: UpdateProfileFields,
  ): Promise<User> {
    return this.axiosInstance
      .patch(`/api/users/${userId}`, fields)
      .then((response) => response.data);
  }

  public async getFoodRequest(requestId: number): Promise<FoodRequest> {
    return this.get(`/api/requests/${requestId}`) as Promise<FoodRequest>;
  }

  public async getDonation(donationId: number): Promise<Donation> {
    return this.get(`/api/donations/${donationId}`) as Promise<Donation>;
  }

  public async getDonationItemsByDonationId(
    donationId: number,
  ): Promise<DonationItem[]> {
    return this.get(`/api/donation-items/${donationId}/all`) as Promise<
      DonationItem[]
    >;
  }

  public async getManufacturerFromOrder(
    orderId: number,
  ): Promise<FoodManufacturer | null> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/manufacturer`)
      .then((response) => response.data);
  }

  public async confirmOrderDelivery(
    orderId: number,
    dto: ConfirmDeliveryDto,
    photos: File[],
  ): Promise<OrderWithoutRelations> {
    const formData = new FormData();

    // DTO fields
    formData.append('dateReceived', dto.dateReceived);
    if (dto.feedback) {
      formData.append('feedback', dto.feedback);
    }

    // files (must be key = "photos")
    for (const file of photos) {
      formData.append('photos', file);
    }

    const { data } = await this.axiosInstance.patch(
      `/api/orders/${orderId}/confirm-delivery`,
      formData,
    );

    return data;
  }

  public async postManufacturer(
    data: ManufacturerApplicationDto,
  ): Promise<AxiosResponse<void>> {
    return this.axiosInstance.post(`/api/manufacturers/application`, data);
  }

  public async getAllOrders(): Promise<OrderSummary[]> {
    return this.axiosInstance
      .get('/api/orders/')
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

  public async getOrderDetailsListFromRequest(
    requestId: number,
  ): Promise<OrderDetails[]> {
    return this.axiosInstance
      .get(`/api/requests/${requestId}/order-details`)
      .then((response) => response.data) as Promise<OrderDetails[]>;
  }

  public async getOrder(orderId: number): Promise<OrderDetails> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}`)
      .then((response) => response.data) as Promise<OrderDetails>;
  }

  async getAllAllocationsByOrder(orderId: number): Promise<Allocation[]> {
    return this.axiosInstance
      .get(`/api/orders/${orderId}/allocations`)
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
    await this.axiosInstance.patch(`/api/pantries/${pantryId}/${decision}`, {
      pantryId,
    });
  }

  public async updateFoodManufacturer(
    manufacturerId: number,
    decision: 'approve' | 'deny',
  ): Promise<void> {
    await this.axiosInstance.patch(
      `/api/manufacturers/${manufacturerId}/${decision}`,
      {
        manufacturerId,
      },
    );
  }

  public async getPantryRequests(pantryId: number): Promise<FoodRequest[]> {
    const data = await this.get(`/api/requests/${pantryId}/all`);
    return data as FoodRequest[];
  }

  public async getVolunteerAssignedRequests(): Promise<FoodRequest[]> {
    const data = await this.get(`/api/volunteers/me/assigned-requests`);
    return data as FoodRequest[];
  }

  public async getCurrentUserPantryId(): Promise<number> {
    const data = await this.get('/api/pantries/my-id');
    return data as number;
  }

  public async getMe(): Promise<User> {
    const data = await this.get('/api/users/me');
    return data as User;
  }
}

export default new ApiClient();
