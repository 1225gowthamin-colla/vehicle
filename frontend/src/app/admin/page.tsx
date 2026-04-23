"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const { logout } = useAuthStore();

  const fetchData = async () => {
    try {
      const [uRes, sRes, vRes, bRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/subadmins'),
        api.get('/vehicles'),
        api.get('/bookings')
      ]);
      setUsers(uRes.data);
      setSubAdmins(sRes.data);
      setVehicles(vRes.data);
      setBookings(bRes.data);
      
      const priceMap: any = {};
      vRes.data.forEach((v: any) => priceMap[v._id] = v.pricePerHour);
      setPrices(priceMap);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePrice = async (id: string) => {
    try {
      await api.put(`/vehicles/${id}`, { pricePerHour: prices[id] });
      toast.success('Price updated successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-950 p-8 text-white font-sans">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Platform Admin</h1>
              <p className="text-slate-400 font-medium">Global oversight & activity monitoring.</p>
            </div>
            <Button variant="destructive" onClick={logout} className="px-8 h-12 font-bold rounded-xl shadow-lg shadow-red-500/20">Sign Out</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: users.length, color: 'from-blue-500 to-blue-600' },
              { label: 'Garages', value: subAdmins.length, color: 'from-indigo-500 to-indigo-600' },
              { label: 'Vehicles', value: vehicles.length, color: 'from-violet-500 to-violet-600' },
              { label: 'Total Activity', value: bookings.length, color: 'from-fuchsia-500 to-fuchsia-600' }
            ].map((stat, i) => (
              <Card key={i} className="bg-white/5 border-white/10 text-white overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`}></div>
                  <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">{stat.label}</p>
                  <p className="text-4xl font-black mt-2">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Pricing Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Vehicle Management
              </h2>
              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 sticky top-0 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Vehicle</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Garage</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 w-32">Price ($)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {vehicles.map((v) => (
                        <tr key={v._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold">{v.name}</p>
                            <p className="text-xs text-slate-500">{v.type}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-300">{v.garage?.garageName}</td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              className="bg-slate-900 border-white/10 h-9"
                              value={prices[v._id] || 0}
                              onChange={(e) => setPrices({ ...prices, [v._id]: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 px-4" onClick={() => handleUpdatePrice(v._id)}>Update</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Global Activity Log */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                Global Activity Log
              </h2>
              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="max-h-[600px] overflow-y-auto p-6 space-y-4">
                  {bookings.slice().reverse().map((b) => (
                    <div key={b._id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        b.tracking?.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 
                        b.tracking?.status === 'On the way' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v11h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold">
                          {b.user?.name} <span className="font-normal text-slate-500">booked</span> {b.vehicle?.name}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase font-black">{b.tracking?.status || 'Pending'}</span>
                          <span>•</span>
                          <span>{new Date(b.createdAt).toLocaleString()}</span>
                          {b.tracking?.arrivedAt && (
                            <>
                              <span>•</span>
                              <span className="text-green-500 font-bold">Arrived: {new Date(b.tracking.arrivedAt).toLocaleTimeString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && <p className="text-center text-slate-500 py-10">No system activity yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
