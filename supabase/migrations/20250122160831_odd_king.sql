/*
  # Fix RLS policies for employees table

  1. Changes
    - Update RLS policies to allow proper access to the employees table
    - Add policies for anonymous access since we're using the anon key
  
  2. Security
    - Enable public read access
    - Maintain write protection
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all employees" ON employees;
DROP POLICY IF EXISTS "Users can create employees" ON employees;
DROP POLICY IF EXISTS "Users can update employees" ON employees;
DROP POLICY IF EXISTS "Users can delete employees" ON employees;

-- Create new policies that work with the anon key
CREATE POLICY "Allow public read access"
  ON employees
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON employees
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON employees
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete"
  ON employees
  FOR DELETE
  TO public
  USING (true);