import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Employee } from './types';
import { toast, Toaster } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { QrScanner } from '@yudiel/react-qr-scanner';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    hire_date: '',
    department: '',
    position: '',
    salary: '',
    status: 'active'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching employees');
      return;
    }
    setEmployees(data);
  }

  function resetForm() {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      hire_date: '',
      department: '',
      position: '',
      salary: '',
      status: 'active'
    });
    setSelectedEmployee(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const employee = {
      ...formData,
      salary: parseFloat(formData.salary)
    };

    if (selectedEmployee) {
      const { error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', selectedEmployee.id);

      if (error) {
        toast.error('Error updating employee');
        return;
      }
      toast.success('Employee updated successfully');
    } else {
      const { error } = await supabase
        .from('employees')
        .insert([employee]);

      if (error) {
        toast.error('Error creating employee');
        return;
      }
      toast.success('Employee created successfully');
    }

    setIsModalOpen(false);
    resetForm();
    fetchEmployees();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Error deleting employee');
        return;
      }
      toast.success('Employee deleted successfully');
      fetchEmployees();
    }
  }

  function handleEdit(employee: Employee) {
    setSelectedEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      hire_date: employee.hire_date,
      department: employee.department,
      position: employee.position,
      salary: employee.salary.toString(),
      status: employee.status
    });
    setIsModalOpen(true);
  }

  async function handleQRCodeScan(result: string) {
    setIsScanning(false);
    
    // Find employee by ID from QR code
    const employee = employees.find(emp => emp.id === result);
    
    if (!employee) {
      toast.error('Invalid QR code or employee not found');
      return;
    }

    // Record attendance
    const { error } = await supabase
      .from('attendance')
      .insert([{
        employee_id: employee.id,
        check_in_time: new Date().toISOString(),
        notes: checkInNotes
      }]);

    if (error) {
      toast.error('Error recording attendance');
      return;
    }

    toast.success(`${employee.first_name} ${employee.last_name} checked in successfully`);
    setCheckInNotes('');
    setIsCheckInModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Management System</h1>
          <div className="space-x-4">
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Check In
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Employee
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowQRCode(employee.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      QR Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Employee Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <input
                      type="date"
                      required
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salary</label>
                    <input
                      type="number"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {selectedEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Employee QR Code</h2>
                <button
                  onClick={() => setShowQRCode(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-center">
                {employees.find(emp => emp.id === showQRCode) && (
                  <QRCodeSVG
                    value={showQRCode}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Check In Modal */}
        {isCheckInModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Check In</h2>
                <button
                  onClick={() => {
                    setIsCheckInModalOpen(false);
                    setIsScanning(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col items-center">
                  {!isScanning ? (
                    <button
                      onClick={() => setIsScanning(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Scan QR Code
                    </button>
                  ) : (
                    <div className="w-full max-w-sm">
                      <QrScanner
                        onDecode={handleQRCodeScan}
                        onError={(error) => console.log(error?.message)}
                      />
                      <button
                        onClick={() => setIsScanning(false)}
                        className="mt-4 w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Cancel Scan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}