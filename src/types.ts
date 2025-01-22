export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hire_date: string;
  department: string;
  position: string;
  salary: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  check_in_time: string;
  notes?: string;
}