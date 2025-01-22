/*
  # HR System Database Schema

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `hire_date` (date)
      - `department` (text)
      - `position` (text)
      - `salary` (numeric)
      - `status` (text) - active/inactive
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on employees table
    - Add policies for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  hire_date date NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  salary numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view all employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (true);