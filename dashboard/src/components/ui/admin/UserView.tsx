import { StatsCardSkeleton, TableRowSkeleton } from '@/components/LoadingSkeletons';
import { Badge } from '@/components/ui/notifications/Common';
import { User, useUsers } from '@/hooks/use-users';
import {
    Camera,
    MoreHorizontal,
    Search,
    User as UserIcon,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export default function UserView() {
    const { data, loading, total, fetchData, updateUser, uploadPhoto } = useUsers();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'STUDENT',
        password: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            phoneNumber: '',
            role: 'STUDENT',
            password: ''
        });
        setEditingUser(null);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleEdit = (user: User) => {
        setFormData({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            role: user.role,
            password: ''
        });
        setEditingUser(user);
        setPreviewUrl(user.photo_url ? `${process.env.NEXT_PUBLIC_API_URL}${user.photo_url}` : null);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchData(page, search);
    }, [page, search, fetchData]);

    const containerRef = useRef<HTMLTableSectionElement>(null);
    useGSAP(() => {
        if (!loading && data.length > 0) {
            gsap.fromTo(
                ".gsap-table-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
            );
        }
    }, { scope: containerRef, dependencies: [data, loading] });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingUser) return; 

        const payload: any = { ...formData };
        if (!payload.password) delete payload.password; 


        const success = await updateUser(editingUser.id, payload);


        if (success && selectedFile) {
             await uploadPhoto(editingUser.id, selectedFile, formData.role);
        }

        if (success) {
            setIsModalOpen(false);
            resetForm();
            toast.success("User updated successfully");
        }
    };

    return (
        <div className="space-y-8 font-sans">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">User Accounts</h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">Manage low-level user credentials and photos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <StatsCardSkeleton />
                ) : (
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{total}</p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Contact</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody ref={containerRef} className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <TableRowSkeleton columns={4} rows={5} />
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="gsap-table-row hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50 hover:-translate-y-0.5 hover:shadow-sm duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden dark:bg-slate-800">
                                                    {item.photo_url ? (
                                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${item.photo_url}`} alt={item.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-slate-200">{item.fullName}</div>
                                                    <div className="text-slate-500 text-xs dark:text-slate-500">{item.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={item.role} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {item.phoneNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleEdit(item)}
                                                className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    <span>Showing {data.length} items (Page {page})</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            Previous
                        </button>
                        <button 
                           disabled={data.length < 10 && (page * 10 >= total)} 
                           onClick={() => setPage(p => p + 1)}
                           className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </Card>


            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col dark:bg-slate-900">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit User</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Update account credentials and profile photo.</p>
                            </div>
                            <button 
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-8">
                             <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Camera className="w-6 h-6 mx-auto mb-1" />
                                                <span className="text-[10px]">Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="text-sm text-blue-600 font-medium hover:underline"
                                    >
                                        Change Photo
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                    </div>
                                     <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                    </div>
                                     <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                            <option value="STUDENT">Student</option>
                                            <option value="PARENT">Parent</option>
                                            <option value="COACH">Coach</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password (Optional)</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Leave blank to keep current" />
                                    </div>
                                </div>
                             </form>
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3 dark:bg-slate-900 dark:border-slate-800">
                             <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                             <button type="submit" form="edit-user-form" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                                Save Changes
                             </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
