import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoomById, deleteRoom } from '../services/roomService';

const DeleteClassroom = () => {
 const navigate = useNavigate();
 const { id } = useParams();
 const [loading, setLoading] = useState(true);
 const [deleting, setDeleting] = useState(false);
 const [error, setError] = useState('');
 const [showSuccessModal, setShowSuccessModal] = useState(false);
 const [roomData, setRoomData] = useState(null);

 useEffect(() => {
 loadRoomData();
 }, [id]);

 const loadRoomData = async () => {
 try {
 setLoading(true);
 const response = await getRoomById(id);
 
 if (response.success) {
 setRoomData(response.data);
 }
 } catch (err) {
 console.error('Load room error:', err);
 setError(err.message || 'Failed to load room data');
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async () => {
 if (!window.confirm(`Are you sure you want to delete classroom ${roomData.room_code}? This action cannot be undone.`)) {
 return;
 }

 try {
 setDeleting(true);
 setError('');

 const response = await deleteRoom(id);

 if (response.success) {
 setShowSuccessModal(true);
 setTimeout(() => {
 navigate('/room-inventory');
 }, 2000);
 }
 } catch (err) {
 console.error('Delete room error:', err);
 setError(err.message || 'Failed to delete classroom');
 } finally {
 setDeleting(false);
 }
 };

 if (loading) {
 return (
 <div className="flex-1 overflow-y-auto bg-background-light">
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
 <p className="text-slate-600">Loading room data...</p>
 </div>
 </div>
 </div>
 );
 }

 if (!roomData) {
 return (
 <div className="flex-1 overflow-y-auto bg-background-light">
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
 <h2 className="text-2xl font-bold text-slate-800 mb-2">Room Not Found</h2>
 <p className="text-slate-600 mb-6">The classroom you're looking for doesn't exist.</p>
 <button
 onClick={() => navigate('/room-inventory')}
 className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 Back to Rooms
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="flex-1 overflow-y-auto bg-background-light">
 {/* Header */}
 <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
 <div className="flex items-center gap-4 flex-1">
 <h2 className="text-2xl font-semibold text-slate-800">Delete Classroom</h2>
 </div>
 </header>

 {/* Main Content */}
 <div className="p-8 max-w-4xl mx-auto">
 {/* Breadcrumb */}
 <nav className="flex text-sm text-slate-500 mb-6 font-medium">
 <button onClick={() => navigate('/admin/dashboard')} className="hover:text-primary">
 Home
 </button>
 <span className="mx-2 text-slate-300">/</span>
 <button onClick={() => navigate('/room-inventory')} className="hover:text-primary">
 Room Inventory
 </button>
 <span className="mx-2 text-slate-300">/</span>
 <span className="text-slate-900 font-semibold">Delete Classroom</span>
 </nav>

 {/* Warning Card */}
 <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
 {/* Error Messages */}
 {error && (
 <div className="mx-8 mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined text-red-600">error</span>
 <p className="text-sm font-semibold text-red-800">{error}</p>
 </div>
 </div>
 )}

 {/* Warning Header */}
 <div className="p-6 bg-red-50 border-b border-red-200">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
 <span className="material-symbols-outlined text-3xl text-red-600">
 warning
 </span>
 </div>
 <div>
 <h3 className="text-xl font-bold text-red-900">Warning: Permanent Deletion</h3>
 <p className="text-sm text-red-700 mt-1">
 This action cannot be undone. Please review the classroom details carefully.
 </p>
 </div>
 </div>
 </div>

 {/* Room Details */}
 <div className="p-8">
 <h4 className="text-lg font-bold text-slate-800 mb-6">
 Classroom Information
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
 Room Code
 </label>
 <p className="text-lg font-semibold text-slate-900">
 {roomData.room_code}
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
 Room Name
 </label>
 <p className="text-lg font-semibold text-slate-900">
 {roomData.room_name}
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
 Location
 </label>
 <p className="text-base text-slate-700 capitalize">
 {roomData.location}
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
 Capacity
 </label>
 <p className="text-base text-slate-700">
 {roomData.capacity} people
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
 Type
 </label>
 <p className="text-base text-slate-700">
 {roomData.description}
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
 Status
 </label>
 <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
 roomData.status === 'AVAILABLE' 
 ? 'bg-green-100 text-green-800'
 : 'bg-red-100 text-red-800'
 }`}>
 {roomData.status}
 </span>
 </div>
 </div>

 {/* Equipment */}
 {roomData.equipment && roomData.equipment.length > 0 && (
 <div className="mb-8">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">
 Equipment
 </label>
 <div className="flex flex-wrap gap-2">
 {roomData.equipment.map((item, index) => (
 <span 
 key={index}
 className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Images */}
 {roomData.images && roomData.images.length > 0 && (
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">
 Images ({roomData.images.length})
 </label>
 <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
 {roomData.images.map((image, index) => (
 <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
 <img
 src={image}
 alt={`${roomData.room_code} - ${index + 1}`}
 className="w-full h-full object-cover"
 />
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Footer Actions */}
 <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
 <button
 onClick={() => navigate('/room-inventory')}
 className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handleDelete}
 disabled={deleting}
 className="px-10 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-xl shadow-red-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {deleting ? (
 <>
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
 <span>Deleting...</span>
 </>
 ) : (
 <>
 <span className="material-symbols-outlined text-lg">delete</span>
 <span>Delete Classroom</span>
 </>
 )}
 </button>
 </div>
 </div>

 {/* Consequences Warning */}
 <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
 <div className="flex gap-3">
 <span className="material-symbols-outlined text-amber-600 flex-shrink-0">
 info
 </span>
 <div>
 <h4 className="font-bold text-amber-900 mb-2">
 What happens when you delete this classroom?
 </h4>
 <ul className="space-y-1 text-sm text-amber-800">
 <li>• All classroom data will be permanently removed</li>
 <li>• Existing bookings associated with this room may be affected</li>
 <li>• Students and staff will no longer see this room in search results</li>
 <li>• This action cannot be reversed</li>
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* Success Modal */}
 {showSuccessModal && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
 <div className="p-8 text-center">
 <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
 <span className="material-symbols-outlined text-5xl text-green-600">
 check_circle
 </span>
 </div>
 <h3 className="text-2xl font-bold text-slate-800 mb-2">
 Deleted Successfully!
 </h3>
 <p className="text-sm text-slate-600">
 Classroom has been permanently deleted. Redirecting...
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default DeleteClassroom;
