import { apiClient } from './api';

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
}

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

const contactService = {
  // Submit contact form
  submitContact: async (data: ContactRequest): Promise<ContactResponse> => {
    const response = await apiClient.post<ContactResponse>('/contact', data);
    return response.data.data!;
  },

  // Get contact by ID (for tracking)
  getContactById: async (id: number): Promise<ContactResponse> => {
    const response = await apiClient.get<ContactResponse>(`/contact/${id}`);
    return response.data.data!;
  },

  // Get user's contact history (if authenticated)
  getUserContacts: async (): Promise<ContactResponse[]> => {
    const response = await apiClient.get<ContactResponse[]>('/contact/my-contacts');
    return response.data.data!;
  }
};

export default contactService;
