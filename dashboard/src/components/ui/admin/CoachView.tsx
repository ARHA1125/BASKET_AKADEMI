import { StatsCardSkeleton, TableRowSkeleton } from '@/components/LoadingSkeletons';
import { Badge } from '@/components/ui/notifications/Common';
import { useCoaches } from '@/hooks/use-academic';
import { Coach } from '@/types/academic';
import {
    Briefcase,
    Check,
    MoreHorizontal,
    Plus,
    Search,
    UserCog,
    X
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export default function CoachView() {
    const { data, loading, total, fetchData, createUnified, updateResource, deleteResource } = useCoaches();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        specialization: '',
        contractStatus: 'Active',
        hourlyRate: '',
        yearsOfExperience: ''
    });

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            phoneNumber: '',
            specialization: '',
            contractStatus: 'Active',
            hourlyRate: '',
            yearsOfExperience: ''
        });
        setEditingId(null);
    };

    const handleEdit = (coach: Coach) => {
        setFormData({
            fullName: coach.user.fullName,
            email: coach.user.email,
            phoneNumber: coach.user.phoneNumber || '',
            specialization: coach.specialization || '',
            contractStatus: coach.contractStatus || 'Active',
            hourlyRate: '',
            yearsOfExperience: ''
        });
        setEditingId(coach.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        toast("Delete Coach", {
            description: "Are you sure you want to delete this coach? This cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    const success = await deleteResource(id);
                    if (success) toast.success("Coach deleted");
                    else toast.error("Failed to delete coach");
                }
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let success = false;
        const payload = { 
            ...formData,
            hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
            yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        };

        if (editingId) {
            success = await updateResource(editingId, payload);
        } else {
            success = await createUnified({
                ...payload,
                password: 'Password123!', 
            });
        }

        if (success) {
            setIsModalOpen(false);
            resetForm();
            toast.success(`Coach ${editingId ? 'updated' : 'created'} successfully!`);
        } else {
            toast.error(`Failed to ${editingId ? 'update' : 'create'} coach.`);
        }
    };

    return (
        <div className="space-y-8 font-sans">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Coach Management</h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">Manage coaching staff, contracts, and assignments.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Coach
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                                    <UserCog className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Coaches</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{total}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <Check className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Contracts</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{data.filter(c => c.contractStatus === 'Active').length}</p> 
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, spec..."
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
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Coach Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Specialization</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody ref={containerRef} className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <TableRowSkeleton columns={4} rows={5} />
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No coaches found.</td>
                                </tr>
                            ) : (
                                data.map((item: Coach) => (
                                    <tr key={item.id} className="gsap-table-row hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50 hover:-translate-y-0.5 hover:shadow-sm duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-xs dark:bg-purple-900 dark:text-purple-300">
                                                    {item.user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-slate-200">{item.user.fullName}</div>
                                                    <div className="text-slate-500 text-xs dark:text-slate-500">{item.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <Briefcase className="w-3 h-3" />
                                                {item.specialization || 'General'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={item.contractStatus || 'Active'} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
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
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingId ? 'Edit Coach' : 'Register New Coach'}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Creates a User account and Coach profile.</p>
                            </div>
                            <button 
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-8">
                             <form id="create-coach-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Coach John" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="coach@example.com" />
                                    </div>
                                     <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="+62..." />
                                    </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialization</label>
                                            <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="e.g. Defense" />
                                        </div>
                                         <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contract Status</label>
                                            <select name="contractStatus" value={formData.contractStatus} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                                <option>Active</option>
                                                <option>Inactive</option>
                                                <option>Probation</option>
                                            </select>
                                        </div>
                                     </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Years Experience</label>
                                            <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="5" />
                                        </div>
                                         <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hourly Rate</label>
                                            <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="100000" />
                                        </div>
                                     </div>
                                </div>
                             </form>
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3 dark:bg-slate-900 dark:border-slate-800">
                             <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                             <button type="submit" form="create-coach-form" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                                {editingId ? 'Update Profile' : 'Create Coach Profile'}
                             </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
