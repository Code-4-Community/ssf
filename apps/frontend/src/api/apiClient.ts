import axios, { type AxiosInstance } from 'axios';
import { User, Pantry } from 'types/types';
import { AssignmentWithRelations, VolunteerType } from 'types/types';

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

  public async getAllAssignments(): Promise<AssignmentWithRelations[]> {
    return this.get('/api/assignments/assignments') as Promise<
      AssignmentWithRelations[]
    >;
  }

  public async updateVolunteerTypeAssignment(
    assignmentId: number,
    body: { volunteerType: VolunteerType },
  ): Promise<void> {
    return this.axiosInstance
      .put(`/api/assignments/updateVolunteerType/${assignmentId}`, body)
      .then(() => {});
  }

  public async updateUserVolunteerRole(
    userId: number,
    body: { role: string },
  ): Promise<void> {
    return this.axiosInstance
      .put(`/api/users/${userId}/role`, body)
      .then(() => {});
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
