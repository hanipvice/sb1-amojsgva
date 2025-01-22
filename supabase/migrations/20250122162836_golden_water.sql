/*
  # Create attendance table and policies

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `check_in_time` (timestamptz)
      - `notes` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `attendance` table
    - Add policy for public access (matching our employee policies)
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  check_in_time timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies that work with the anon key
CREATE POLICY "Allow public read access"
  ON attendance
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON attendance
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON attendance
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete"
  ON attendance
  FOR DELETE
  TO public
  USING (true);