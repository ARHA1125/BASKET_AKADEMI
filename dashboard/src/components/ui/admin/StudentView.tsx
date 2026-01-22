import { SearchableSelect } from '@/components/SearchableSelect';
import { Badge } from '@/components/ui/notifications/Common';
import { useParents, useStudents } from '@/hooks/use-academic';
import { Student } from '@/types/academic';
import {
    Check,
    FileText,
    MoreHorizontal,
    Plus,
    Ruler,
    Search,
    User,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export default function StudentView() {
    const { 
        data: filteredData,
        loading, 
        total, 
        fetchData, 
        createUnified, 
        updateResource, 
        deleteResource,
        activeTab,
        setActiveTab,
        stats,
        allData 
    } = useStudents();
    
    const { data: parents, fetchData: fetchParents } = useParents();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        position: 'Point Guard',
        height: '',
        weight: '',
        birthDate: '',
        parentId: ''
    });

    useEffect(() => {
        fetchParents(1, '', 100); 
    }, [fetchParents]);

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            position: 'Point Guard',
            height: '',
            weight: '',
            birthDate: '',
            parentId: ''
        });
        setEditingId(null);
    };

    const handleEdit = (student: Student) => {
        setFormData({
            fullName: student.user.fullName,
            email: student.user.email,
            position: student.position,
            height: student.height.toString(),
            weight: student.weight.toString(),
            birthDate: student.birthDate || '',
            parentId: student.parent?.id || '' 
        });
        setEditingId(student.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        toast("Delete Student", {
            description: "Are you sure you want to delete this student? This cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    const success = await deleteResource(id);
                    if (success) toast.success("Student deleted");
                    else toast.error("Failed to delete student");
                }
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    const handleApprove = async (id: string) => {
        const success = await updateResource(id, { status: 'Active' });
        if (success) {
            toast.success("Student approved and activated");
            fetchData(page, search); 
        } else {
            toast.error("Failed to approve student");
        }
    };

    useEffect(() => {
        fetchData(page, search);
    }, [page, search, fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let success = false;
        const payload = {
            ...formData,
            height: Number(formData.height),
            weight: Number(formData.weight),
            birthDate: formData.birthDate || undefined,
            position: formData.position || undefined,
            parentId: formData.parentId || undefined
        };

        if (editingId) {
            success = await updateResource(editingId, payload);
        } else {
            success = await createUnified({
                ...payload,
                password: 'Password123!', 
                birthDate: new Date().toISOString()
            });
        }

        if (success) {
            setIsModalOpen(false);
            resetForm();
            toast.success(`Student ${editingId ? 'updated' : 'created'} successfully!`);
        } else {
            toast.error(`Failed to ${editingId ? 'update' : 'create'} student.`);
        }
    };

    const activeCount = stats.active;

    return (
        <div className="space-y-8 font-sans">
            
    
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Student Management</h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">Manage athletic profiles, accounts, and guardians.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/apply" 
                        target="_blank"
                        className="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        View Application Form
                    </Link>
                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Student
                    </button>
                </div>
            </div>

           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
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
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Members</p>
                            
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{activeCount > 0 ? activeCount : total}</p>
                        </div>
                    </div>
                </Card>
                
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email..."
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
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Student Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Athletic Profile</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Parent / Guardian</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No students found matching current filter.</td>
                                </tr>
                            ) : (
                                filteredData.map((item: Student) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs dark:bg-blue-900 dark:text-blue-300">
                                                    {item.user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-slate-200">{item.user.fullName}</div>
                                                    <div className="text-slate-500 text-xs dark:text-slate-500">{item.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 dark:text-slate-200">{item.position || '-'}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">
                                                {item.height ? `${item.height}cm` : '-'} • {item.weight ? `${item.weight}kg` : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.parent ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {item.parent.user?.fullName || item.parentName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={item.user.status || 'Active'} size="sm" />
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
                                                {item.user.status === 'Pending' && (
                                                     <button 
                                                        onClick={() => handleApprove(item.id)}
                                                        className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-xs px-2 py-1 ml-2 transition-colors"
                                                        title="Approve Application"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                 {/* Pagination - Simplified implementation matching generic table style */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    <span>Showing {filteredData.length} items (Page {page})</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            Previous
                        </button>
                        <button 
                           disabled={allData.length < 10 && (page * 10 >= total)} // Logic approximate
                           onClick={() => setPage(p => p + 1)}
                           className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </Card>

            {/* --- UNIFIED CREATION MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col dark:bg-slate-900">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingId ? 'Edit Student' : 'Register New Student'}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{editingId ? 'Update student details.' : 'Creates a User account and Student profile simultaneously.'}</p>
                            </div>
                            <button 
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-8">
                             <form id="create-student-form" onSubmit={handleSubmit} className="space-y-8">
                                <section>
                                     <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide dark:text-slate-200">Account Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                            <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="student@example.com" />
                                        </div>
                                        <div className="space-y-1.5 ">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign Parent</label>
                                            <SearchableSelect
                                                value={formData.parentId}
                                                onChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                                                options={parents.map(p => ({
                                                    label: p.user.fullName,
                                                    value: p.id,
                                                    description: p.user.email
                                                }))}
                                                placeholder="Search & Select Parent..."
                                                searchPlaceholder="Search by name or email..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                                            <Ruler className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide dark:text-slate-200">Athletic Profile</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                         <div className="space-y-1.5 col-span-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
                                            <select name="position" value={formData.position} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                                <option>Point Guard</option>
                                                <option>Shooting Guard</option>
                                                <option>Small Forward</option>
                                                <option>Power Forward</option>
                                                <option>Center</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (cm)</label>
                                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                        </div>
                                         <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (kg)</label>
                                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                        </div>
                                    </div>
                                </section>
                             </form>
                        </div>
                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3 dark:bg-slate-900 dark:border-slate-800">
                             <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                             <button type="submit" form="create-student-form" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                                {editingId ? 'Update Profile' : 'Create Student Profile'}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
