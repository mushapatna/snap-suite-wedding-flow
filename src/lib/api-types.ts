export interface ApiPagination<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export type ApiListResponse<T> = T[] | ApiPagination<T>;

export interface UserDTO {
  id: string;
  username: string;
  email: string;
}

export type UserRole =
  | 'admin'
  | 'studio_owner'
  | 'project_manager'
  | 'photographer'
  | 'cinematographer'
  | 'drone_operator'
  | 'assistant'
  | 'client'
  | 'photo_editor'
  | 'video_editor';

export interface ProfileDTO {
  id: string;
  role: UserRole | string;
  user?: UserDTO;
  full_name?: string | null;
  company_name?: string | null;
  plan_type?: string | null;
  [key: string]: unknown;
}

export interface ProjectDTO {
  id: string;
  couple_name: string;
  event_date: string;
  event_type: string;
  location: string;
  service_type: string;
  status: string;
  progress_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventDTO {
  id: string;
  project: string;
  event_name: string;
  event_date: string;
  status: string;
  time_from?: string | null;
  time_to?: string | null;
  location?: string | null;
  google_map_link?: string | null;
  photographer?: string | null;
  cinematographer?: string | null;
  drone_operator?: string | null;
  site_manager?: string | null;
  assistant?: string | null;
  details?: string | null;
  instructions?: string | null;
  sample_image_url?: string | null;
}

export interface TaskDTO {
  id: string;
  project: string;
  title: string;
  department: string;
  category?: string | null;
  priority?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
  estimated_hours?: number | null;
  description?: string | null;
  status: string;
  expected_deliverables?: string | null;
  project_details?: {
    couple_name?: string;
    event_type?: string;
    status?: string;
  };
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  role: string;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  status: string;
  created_at?: string;
  category?: string[];
}

export interface LoginResponseDTO {
  token: string;
  user_id: number;
  email: string;
}
