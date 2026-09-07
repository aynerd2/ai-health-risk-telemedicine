/**
 * Thin typed client around the FastAPI backend (Section 3.2.2).
 * All requests go to NEXT_PUBLIC_API_BASE_URL, set in next.config.js / .env.local.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export type UserRole = "patient" | "doctor" | "admin";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: UserRole;
}

export type Sex = "male" | "female" | "other";

// Numeric codes match the trained heart-disease model's training data
// exactly (backend/scripts/train_heart_model.py) — see the labeled <select>
// options in the intake form for what each code means.
export type ChestPainType = 0 | 1 | 2 | 3;
export type RestingECG = 0 | 1 | 2;
export type STSlope = 0 | 1 | 2;
export type Thalassemia = 0 | 1 | 2 | 3;

export type SmokingHistory = "never" | "No Info" | "current" | "former" | "ever" | "not current";

export interface HealthIntake {
  // Demographics — required, used by all three models
  age: number;
  sex: Sex;

  // Vitals & labs — optional; each model fills gaps with training-set medians
  systolic_bp?: number;
  cholesterol?: number;
  blood_glucose_mgdl?: number;
  hba1c_level?: number;
  bmi?: number;
  max_heart_rate?: number;

  // Cardiac history / exam findings — heart-disease model
  chest_pain_type?: ChestPainType;
  exercise_angina?: boolean;
  resting_ecg?: RestingECG;
  st_slope?: STSlope;
  st_depression?: number;
  major_vessels_colored?: number;
  thalassemia?: Thalassemia;

  // Lifestyle
  smoking_history?: SmokingHistory;
  drinks_alcohol?: boolean;
  physically_active?: boolean;

  // Prior-diagnosis flags — feed the diabetes model
  has_hypertension?: boolean;
  has_heart_disease?: boolean;
}

export interface ConditionRisk {
  condition: "heart_disease" | "diabetes" | "hypertension";
  risk_score: number;
  risk_class: "low" | "elevated";
}

export interface PredictionResponse {
  record_id: number;
  results: ConditionRisk[];
  any_elevated: boolean;
}

export interface PredictionRead {
  prediction_id: number;
  condition: ConditionRisk["condition"];
  risk_score: number;
  risk_class: "low" | "elevated";
  date_generated: string;
}

export interface HealthRecordHistory {
  record_id: number;
  date_recorded: string;
  predictions: PredictionRead[];
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  appt_id: number;
  patient_id: number;
  doctor_id: number;
  date_time: string;
  status: AppointmentStatus;
}

export interface Doctor {
  doctor_id: number;
  full_name: string;
  specialty: string | null;
  is_approved: boolean;
}

export interface Consultation {
  consult_id: number;
  appt_id: number;
  notes: string | null;
  diagnosis: string | null;
  prescribed_action: string | null;
  recorded_at: string;
}

export interface CurrentUser {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface UserAdminRead {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface PendingDoctor {
  doctor_id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialty: string | null;
  license_no: string | null;
}

export interface PlatformStats {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  pending_doctor_approvals: number;
  total_predictions: number;
  elevated_predictions: number;
  total_appointments: number;
  completed_consultations: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof URLSearchParams)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async register(payload: { full_name: string; email: string; password: string; role: UserRole }) {
    return request("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const form = new URLSearchParams({ username: email, password });
    const data = await request<TokenResponse>("/api/v1/auth/login", { method: "POST", body: form });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("role", data.role);
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
  },

  isLoggedIn(): boolean {
    return !!getToken();
  },

  getRole(): UserRole | null {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("role") as UserRole | null) ?? null;
  },

  async me(): Promise<CurrentUser> {
    return request("/api/v1/auth/me");
  },

  async forgotPassword(email: string): Promise<{ reset_token: string }> {
    return request("/api/v1/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  },

  async resetPassword(reset_token: string, new_password: string) {
    return request("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ reset_token, new_password }),
    });
  },

  async submitIntake(payload: HealthIntake): Promise<PredictionResponse> {
    return request("/api/v1/predictions", { method: "POST", body: JSON.stringify(payload) });
  },

  async myPredictionHistory(): Promise<HealthRecordHistory[]> {
    return request("/api/v1/predictions/mine");
  },

  async listDoctors(): Promise<Doctor[]> {
    return request("/api/v1/doctors");
  },

  async myAppointments(): Promise<Appointment[]> {
    return request("/api/v1/appointments/mine");
  },

  async bookAppointment(doctor_id: number, date_time: string): Promise<Appointment> {
    return request("/api/v1/appointments", { method: "POST", body: JSON.stringify({ doctor_id, date_time }) });
  },

  async cancelAppointment(apptId: number): Promise<Appointment> {
    return request(`/api/v1/appointments/${apptId}/cancel`, { method: "POST" });
  },

  async updateAppointmentStatus(apptId: number, status: AppointmentStatus): Promise<Appointment> {
    return request(`/api/v1/appointments/${apptId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async recordConsultation(
    apptId: number,
    payload: { notes?: string; diagnosis?: string; prescribed_action?: string }
  ): Promise<Consultation> {
    return request(`/api/v1/appointments/${apptId}/consultation`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getConsultation(apptId: number): Promise<Consultation> {
    return request(`/api/v1/appointments/${apptId}/consultation`);
  },

  consultationSocketUrl(apptId: number, sender: "patient" | "doctor") {
    const wsBase = API_BASE_URL.replace(/^http/, "ws");
    return `${wsBase}/api/v1/telemedicine/ws/${apptId}?sender=${sender}`;
  },

  admin: {
    async listUsers(): Promise<UserAdminRead[]> {
      return request("/api/v1/admin/users");
    },
    async pendingDoctors(): Promise<PendingDoctor[]> {
      return request("/api/v1/admin/doctors/pending");
    },
    async approveDoctor(doctorId: number): Promise<PendingDoctor> {
      return request(`/api/v1/admin/doctors/${doctorId}/approve`, { method: "POST" });
    },
    async deactivateUser(userId: number): Promise<UserAdminRead> {
      return request(`/api/v1/admin/users/${userId}/deactivate`, { method: "POST" });
    },
    async activateUser(userId: number): Promise<UserAdminRead> {
      return request(`/api/v1/admin/users/${userId}/activate`, { method: "POST" });
    },
    async stats(): Promise<PlatformStats> {
      return request("/api/v1/admin/stats");
    },
  },
};
