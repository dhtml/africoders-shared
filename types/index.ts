export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
  bio?: string;
  xp?: number;
  level?: number;
  current_streak?: number;
  badges?: Badge[];
  role?: 'user' | 'moderator' | 'admin' | 'superadmin' | 'instructor' | 'mentor';
  phone?: string;
  website?: string;
  country?: string;
  email_verified_at?: string;
  last_login_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  name: string;
  slug: string;
  domain: string;
  icon: string;
  description?: string;
  category?: string;
  enabled?: boolean;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price_usd: number;
  price_ngn: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category?: CourseCategory;
  instructor: User;
  modules_count: number;
  lessons_count: number;
  enrolled_count: number;
  is_published: boolean;
  created_at: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  week_number: number;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order: number;
  completed?: boolean;
}

export interface Enrollment {
  id: string;
  course: Course;
  enrolled_at: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image?: string;
  category?: string;
  tags: string[];
  author: User;
  views_count: number;
  likes_count: number;
  comments_count: number;
  read_time_minutes: number;
  is_published: boolean;
  published_at: string;
}

export interface BlogComment {
  id: string;
  body: string;
  author: User;
  parent_id?: string;
  replies?: BlogComment[];
  created_at: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  post_type: 'question' | 'discussion' | 'project_showcase' | 'resource_share';
  author: User;
  votes: number;
  replies_count: number;
  is_pinned: boolean;
  is_resolved: boolean;
  tags: string[];
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  salary_range?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  remote: boolean;
  description: string;
  tags: string[];
  url: string;
  source: string;
  posted_at: string;
}

export interface TalentProfile {
  id: string;
  user: User;
  skills: string[];
  experience_level: 'junior' | 'mid' | 'senior' | 'lead';
  availability: string;
  expected_salary?: string;
  is_searchable: boolean;
  is_verified: boolean;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: 'NGN' | 'USD';
  status: 'active' | 'suspended' | 'closed';
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  created_at: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  price_usd: number;
  price_ngn: number;
  billing_interval: 'monthly' | 'yearly';
  features: string[];
  limits: Record<string, number>;
  trial_days: number;
  is_popular?: boolean;
}

export interface Subscription {
  id: string;
  plan: BillingPlan;
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Bootcamp {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration_weeks: number;
  price_usd: number;
  price_ngn: number;
  capacity: number;
  enrolled_count: number;
  status: 'draft' | 'upcoming' | 'enrolling' | 'active' | 'completed' | 'archived';
  isa_available: boolean;
  instructor: User;
  start_date: string;
}

export interface Mentor {
  id: string;
  user: User;
  skills: string[];
  hourly_rate: number;
  rating: number;
  reviews_count: number;
  availability: string;
  session_types: string[];
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: User;
  likes_count: number;
  uses_count: number;
  price?: number;
  is_free: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  rate_limit: number;
  scopes: string[];
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_users?: number;
  active_courses?: number;
  total_enrollments?: number;
  total_revenue?: number;
  active_subscriptions?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}
