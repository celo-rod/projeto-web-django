export type Employee = {
  id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  is_superuser: boolean;
  is_staff: boolean;
};