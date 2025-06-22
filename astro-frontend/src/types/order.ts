export type Order = {
  id: number;
  table_number: number;
  responsible_name: string;
  is_paid: boolean;
  opened_at: string;
  closed_at: string | null;
}