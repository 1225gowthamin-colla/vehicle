"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SubAdminDashboard() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'users' | 'bookings'>('vehicles');
  const { user, logout } = useAuthStore();
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('Car');
  const [imageUrl, setImageUrl] = useState('https://loremflickr.com/800/600/car');

  const fetchData = async () => {
    try {
      const [vData, uData, bData] = await Promise.all([
        api.get('/vehicles'),
        api.get('/admin/users'),
        api.get('/bookings')
      ]);
      
      const myVehicles = vData.data.filter((v: any) => 
        (v.garage?._id || v.garage) === user?._id
      );
      setVehicles(myVehicles);
      setUsers(uData.data);
      setBookings(bData.data);
      
      console.log('Dashboard Data Loaded:', {
        vehicles: myVehicles.length,
        bookings: bData.data.length
      });
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error('Failed to load dashboard data. Check console for details.');
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        name,
        type,
        images: [imageUrl],
        isAvailable: true
      });
      toast.success('Vehicle created successfully!');
      setName('');
      setImageUrl('https://loremflickr.com/800/600/car');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create vehicle');
    }
  };

  const handleUpdateTracking = async (bookingId: string, status: string) => {
    try {
      await api.put(`/tracking/${bookingId}`, { 
        status,
        currentLocation: status === 'On the way' ? 'Moving to destination' : status === 'Delivered' ? 'Destination' : 'Garage',
        estimatedTime: status === 'On the way' ? '15 mins' : '0 mins'
      });
      toast.success('Tracking updated');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update tracking');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['subadmin']}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8 text-white">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Garage Dashboard</h1>
              <div className="flex gap-4 mt-2">
                {['vehicles', 'users', 'bookings'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-200 bg-white/10 px-4 py-2 rounded-full">
                Garage: {user?.garageName}
              </span>
              <Button variant="destructive" onClick={logout}>Logout</Button>
            </div>
          </div>

          {activeTab === 'vehicles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Create Vehicle Form */}
              <div className="lg:col-span-1">
                <Card className="bg-white/10 backdrop-blur-md border-white/10 text-white shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Add New Vehicle</CardTitle>
                    <CardDescription className="text-gray-300">Expand your garage fleet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateVehicle} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-200">Vehicle Name / Model</Label>
                        <Input
                          id="name"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          placeholder="e.g., Tesla Model 3"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-200">Vehicle Type</Label>
                        <Select value={type} onValueChange={(val) => { if (val) setType(val as string); }}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 text-white border-white/10">
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Bike">Bike</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-gray-200">Image URL</Label>
                        <Input
                          id="imageUrl"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          placeholder="https://..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                      </div>
                      {imageUrl && (
                        <div className="relative h-32 w-full rounded-md overflow-hidden mt-4 border border-white/10">
                          <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" />
                        </div>
                      )}
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
                        Add Vehicle
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Vehicle List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-semibold">Your Fleet</h2>
                {vehicles.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
                    <p className="text-gray-400">No vehicles added yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {vehicles.map((v) => (
                      <Card key={v._id} className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                        <div className="h-48 w-full relative">
                          <img 
                            src={v.images?.[0] || 'https://loremflickr.com/800/600/car'} 
                            alt={v.name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                            {v.type}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-white mb-2">{v.name}</h3>
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <p className="text-gray-400">Price</p>
                              <p className="font-semibold text-lg text-white">
                                {v.pricePerHour > 0 ? `$${v.pricePerHour}/hr` : <span className="text-yellow-400">Pending Admin</span>}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-400">Status</p>
                              <span className={`font-semibold ${v.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                                {v.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Registered Users</h2>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/10 text-gray-300 uppercase text-xs tracking-wider">
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                        <td className="px-6 py-4 text-gray-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            u.role === 'subadmin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Active Service Bookings
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-gray-400">No active bookings for your garage.</p>
                  </div>
                ) : (
                  bookings.map((b) => (
                    <Card key={b._id} className="bg-white/5 backdrop-blur-md border-white/10 text-white shadow-xl overflow-hidden group">
                      <div className="h-32 w-full relative">
                        <img 
                          src={b.vehicle?.images?.[0] || 'https://loremflickr.com/800/600/car'} 
                          alt={b.vehicle?.name}
                          className="object-cover w-full h-full opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        <div className="absolute bottom-2 left-4">
                          <h4 className="font-bold text-lg">{b.vehicle?.name || 'Unknown Vehicle'}</h4>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{b.vehicle?.type || 'N/A'}</p>
                        </div>
                        <div className="absolute top-2 right-4 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-xs font-bold border border-white/10">
                          ${b.vehicle?.pricePerHour || 0}/hr
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start border-b border-white/5 pb-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Customer Details</p>
                            <p className="font-bold text-white flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 border border-blue-500/30">
                                {b.user?.name?.[0] || '?'}
                              </span>
                              {b.user?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-xs text-gray-400">{b.user?.email || 'No email provided'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.tracking?.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            b.tracking?.status === 'On the way' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {b.tracking?.status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Booking Time:</span>
                            <span className="text-gray-300 font-medium">{new Date(b.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Current Location:</span>
                            <span className="text-gray-200 font-bold">{b.tracking?.currentLocation}</span>
                          </div>
                          {b.tracking?.arrivedAt && (
                            <div className="flex justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                              <span className="text-green-500 font-bold">Arrival Confirmed:</span>
                              <span className="text-green-400 font-black">{new Date(b.tracking.arrivedAt).toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                          <Button size="sm" variant="ghost" className="text-[10px] h-7 px-1 hover:bg-white/5" onClick={() => handleUpdateTracking(b._id, 'Pending')}>Reset</Button>
                          <Button size="sm" variant="outline" className="text-[10px] h-7 px-1 text-blue-400 border-blue-400/30 hover:bg-blue-400/10" onClick={() => handleUpdateTracking(b._id, 'On the way')}>On Way</Button>
                          <Button size="sm" variant="outline" className="text-[10px] h-7 px-1 text-green-400 border-green-400/30 hover:bg-green-400/10" onClick={() => handleUpdateTracking(b._id, 'Delivered')}>Arrived</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
