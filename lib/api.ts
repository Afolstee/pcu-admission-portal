const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

export class ApiClient {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  static getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private static async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return { data: data as T, status: response.status };
  }

  // Auth endpoints
  static async signup(name: string, email: string, password: string, phone_number: string) {
    const { data } = await this.fetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone_number }),
    });
    return data;
  }

  static async login(email: string, password: string) {
    const { data } = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  }

  static async verifyToken() {
    const { data } = await this.fetch('/auth/verify-token', {
      method: 'GET',
    });
    return data;
  }

  static async logout() {
    const { data } = await this.fetch('/auth/logout', {
      method: 'POST',
    });
    return data;
  }

  // Applicant endpoints
  static async getPrograms() {
    const { data } = await this.fetch('/applicant/programs');
    return data;
  }

  static async selectProgram(program_id: number) {
    const { data } = await this.fetch('/applicant/select-program', {
      method: 'POST',
      body: JSON.stringify({ program_id }),
    });
    return data;
  }

  static async getFormTemplate(program_id: number) {
    const { data } = await this.fetch(`/applicant/form/${program_id}`);
    return data;
  }

  static async submitForm(formData: any) {
    const { data } = await this.fetch('/applicant/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {} as any, // Override to not set JSON content type for form data
    });
    return data;
  }

  static async uploadDocument(file: File, form_id: number, document_type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('form_id', form_id.toString());
    formData.append('document_type', document_type);

    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/applicant/upload-document`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  static async getForm(applicant_id: number) {
    const { data } = await this.fetch(`/applicant/get-form/${applicant_id}`);
    return data;
  }

  static async submitApplication(applicant_id: number) {
    const { data } = await this.fetch('/applicant/submit-application', {
      method: 'POST',
      body: JSON.stringify({ applicant_id }),
    });
    return data;
  }

  static async getApplicantStatus() {
    const { data } = await this.fetch('/applicant/get-applicant-status');
    return data;
  }

  // Admin endpoints
  static async getApplications(status?: string, program_id?: number) {
    let endpoint = '/admin/applications';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (program_id) params.append('program_id', program_id.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;

    const { data } = await this.fetch(endpoint);
    return data;
  }

  static async getApplicationDetails(applicant_id: number) {
    const { data } = await this.fetch(`/admin/application/${applicant_id}`);
    return data;
  }

  static async reviewApplication(
    applicant_id: number,
    recommendation: 'accept' | 'reject' | 'recommend_other_program',
    review_notes?: string,
    recommended_program_id?: number
  ) {
    const { data } = await this.fetch('/admin/review-application', {
      method: 'POST',
      body: JSON.stringify({
        applicant_id,
        recommendation,
        review_notes,
        recommended_program_id,
      }),
    });
    return data;
  }

  static async sendAdmissionLetter(
    applicant_id: number,
    admission_date?: string,
    template_id?: number
  ) {
    const { data } = await this.fetch('/admin/send-admission-letter', {
      method: 'POST',
      body: JSON.stringify({ applicant_id, admission_date, template_id }),
    });
    return data;
  }

  static async sendBatchLetters(
    applicant_ids: number[],
    admission_date?: string,
    template_id?: number
  ) {
    const { data } = await this.fetch('/admin/send-batch-letters', {
      method: 'POST',
      body: JSON.stringify({ applicant_ids, admission_date, template_id }),
    });
    return data;
  }

  static async revokeAdmission(applicant_id: number) {
    const { data } = await this.fetch('/admin/revoke-admission', {
      method: 'POST',
      body: JSON.stringify({ applicant_id }),
    });
    return data;
  }

  static async getStatistics() {
    const { data } = await this.fetch('/admin/statistics');
    return data;
  }

  static async getLetterTemplates() {
    const { data } = await this.fetch('/admin/letter-templates');
    return data;
  }

  static async getLetterTemplate(template_id: number) {
    const { data } = await this.fetch(`/admin/letter-template/${template_id}`);
    return data;
  }
}
