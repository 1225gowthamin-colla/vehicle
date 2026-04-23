"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function UserDashboard() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const { user, logout } = useAuthStore();

  const fetchData = async () => {
    try {
      const [vData, bData] = await Promise.all([
        api.get('/vehicles'),
        api.get('/bookings')
      ]);
      setVehicles(vData.data.filter((v: any) => v.isAvailable && v.pricePerHour > 0));
      setBookings(bData.data);
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = async (vehicleId: string) => {
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      await api.post('/bookings', {
        vehicleId,
        startTime,
        endTime
      });
      toast.success('Vehicle booked successfully!');
      fetchData(); // Refresh to show the new booking
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book vehicle');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 text-white">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Find Your Ride</h1>
              <p className="text-indigo-200 mt-1">Book a premium vehicle from local garages.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-indigo-100 bg-white/10 px-4 py-2 rounded-full shadow-inner">
                Welcome, {user?.name}
              </span>
              <Button variant="destructive" onClick={logout} className="shadow-lg">Logout</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Vehicle Catalog */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-white/90">Available Vehicles</h2>
              
              {vehicles.length === 0 ? (
                <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-indigo-200 text-lg">No vehicles available at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {vehicles.map((v) => (
                    <Card key={v._id} className="bg-white/10 backdrop-blur-md border-white/10 overflow-hidden shadow-2xl transition-all hover:-translate-y-1 hover:shadow-indigo-500/20 group flex flex-col">
                      <div className="h-40 w-full relative overflow-hidden">
                        <img 
                          src={v.images?.[0] || 'https://loremflickr.com/800/600/car'} 
                          alt={v.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-medium text-indigo-300 uppercase">{v.type}</p>
                            <h3 className="font-bold text-lg text-white leading-tight">{v.name}</h3>
                          </div>
                          <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20">
                            <p className="font-bold text-sm text-white">${v.pricePerHour}<span className="text-[10px] font-normal text-indigo-200">/hr</span></p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 flex-grow flex flex-col justify-between space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                          </div>
                          <p className="text-xs text-white truncate">{v.garage?.garageName || 'Premium Garage'}</p>
                        </div>
                        <Button 
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-all border-none h-9 text-sm" 
                          onClick={() => handleBook(v._id)}
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* My Bookings & Tracking */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-white/90">My Bookings & Tracking</h2>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-slate-400">
                    No active bookings.
                  </div>
                ) : (
                  bookings.map((b) => (
                    <Card key={b._id} className="bg-white/10 backdrop-blur-md border-white/10 text-white shadow-xl">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{b.vehicle?.name}</h4>
                            <p className="text-xs text-indigo-300">{b.garage?.garageName}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.tracking?.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            b.tracking?.status === 'On the way' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {b.tracking?.status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Current Location:</span>
                            <span className="text-white font-medium">{b.tracking?.currentLocation || 'Garage'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">
                              {b.tracking?.status === 'Delivered' ? 'Arrived At:' : 'Estimated Arrival:'}
                            </span>
                            <span className={`${b.tracking?.status === 'Delivered' ? 'text-green-400' : 'text-indigo-300'} font-medium`}>
                              {b.tracking?.status === 'Delivered' 
                                ? new Date(b.tracking.arrivedAt).toLocaleTimeString() 
                                : b.tracking?.estimatedTime || 'Calculating...'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 pt-1">
                            Last update: {new Date(b.tracking?.updatedAt).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Tracking Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              b.tracking?.status === 'Delivered' ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: 
                              b.tracking?.status === 'Delivered' ? '100%' : 
                              b.tracking?.status === 'On the way' ? '60%' : '10%' 
                            }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
