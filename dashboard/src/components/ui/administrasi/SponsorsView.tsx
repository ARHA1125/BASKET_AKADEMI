import { useState, useEffect, useRef } from 'react';
import { Card, Title, Text } from '@/components/ui/notifications/Common';
import { Plus, Search, Trash2, Loader2, Save, X, UploadCloud, FileText, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  agreementDocUrl?: string;
  createdAt: string;
}

export default function SponsorsView() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const [selectedSdk, setSelectedSdk] = useState<Sponsor | null>(null); 
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  
  
  const [existingLogo, setExistingLogo] = useState<string | undefined>(undefined);
  const [existingDoc, setExistingDoc] = useState<string | undefined>(undefined);

  const containerRef = useRef<HTMLTableSectionElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/sponsors`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      } else {
        toast.error('Failed to fetch sponsors');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching sponsors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(() => {
    if (!loading && sponsors.length > 0) {
      gsap.fromTo(
        ".gsap-table-row",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [sponsors, loading] });

  const resetForm = () => {
      setName('');
      setLogoFile(null);
      setDocFile(null);
      setExistingLogo(undefined);
      setExistingDoc(undefined);
      setSelectedSdk(null);
  };

  const openAddModal = () => {
      resetForm();
      setIsAddModalOpen(true);
  };

  const openEditModal = (sponsor: Sponsor) => {
      resetForm();
      setSelectedSdk(sponsor);
      setName(sponsor.name);
      setExistingLogo(sponsor.logoUrl);
      setExistingDoc(sponsor.agreementDocUrl);
      setIsEditModalOpen(true);
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', name);
    if (logoFile) formData.append('logo', logoFile);
    if (docFile) formData.append('agreementDoc', docFile);

    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/sponsors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Sponsor added successfully');
        setIsAddModalOpen(false);
        resetForm();
        fetchSponsors();
      } else {
        toast.error('Failed to add sponsor');
      }
    } catch (error) {
        console.error(error);
      toast.error('Error adding sponsor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSponsor = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSdk) return;
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', name);
      if (logoFile) formData.append('logo', logoFile);
      if (docFile) formData.append('agreementDoc', docFile);
      
      try {
        const token = Cookies.get('auth_token');
        const response = await fetch(`${apiUrl}/administration/sponsors/${selectedSdk.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
  
        if (response.ok) {
          toast.success('Sponsor updated successfully');
          setIsEditModalOpen(false);
          resetForm();
          fetchSponsors();
        } else {
          toast.error('Failed to update sponsor');
        }
      } catch (error) {
          console.error(error);
        toast.error('Error updating sponsor');
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;

    try {
        const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/sponsors/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Sponsor deleted');
        fetchSponsors();
      } else {
        toast.error('Failed to delete sponsor');
      }
    } catch (error) {
        console.error(error);
      toast.error('Error deleting sponsor');
    }
  };

  const filteredSponsors = sponsors.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <Title>Sponsors Management</Title>
           <Text>Manage sponsor partners, logos, and agreements.</Text>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Search sponsors..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                />
            </div>
            <button 
                onClick={openAddModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
                <Plus size={16} />
                Add Sponsor
            </button>
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-500">
                    <Loader2 className="animate-spin mr-2" /> Loading...
                </div>
            ) : filteredSponsors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <p>No sponsors found.</p>
                </div>
            ) : (
                <table className="w-full text-left">
                     <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Logo</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Agreement</th>
                            <th className="px-6 py-3">Date Added</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody ref={containerRef} className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredSponsors.map(sponsor => (
                            <tr key={sponsor.id} className="gsap-table-row hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors hover:-translate-y-0.5 hover:shadow-sm duration-200">
                                <td className="px-6 py-3">
                                    {sponsor.logoUrl ? (
                                        <img src={`${apiUrl}${sponsor.logoUrl}`} alt={sponsor.name} className="h-10 w-auto object-contain rounded-md bg-white border border-slate-100" />
                                    ) : (
                                        <div className="h-10 w-10 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-500">N/A</div>
                                    )}
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-50">{sponsor.name}</td>
                                <td className="px-6 py-3">
                                    {sponsor.agreementDocUrl ? (
                                        <a href={`${apiUrl}${sponsor.agreementDocUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                            <FileText size={14} /> View Doc
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-sm text-slate-500">{new Date(sponsor.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => openEditModal(sponsor)}
                                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSponsor(sponsor.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </Card>
      
      {/* Add/Edit Modal (Can be refactored into a single component, but keeping separate for clarity if logic diverges) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <Title>{isEditModalOpen ? 'Edit Sponsor' : 'Add New Sponsor'}</Title>
                    <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={isEditModalOpen ? handleEditSponsor : handleAddSponsor} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sponsor Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                            placeholder="Enter name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Logo Image {isEditModalOpen && <span className="text-xs font-normal text-slate-500">(Optional: Leave empty to keep current)</span>}
                        </label>
                        
                        {/* Current Logo Preview for Edit */}
                        {isEditModalOpen && existingLogo && !logoFile && (
                            <div className="mb-2 p-2 border border-slate-200 rounded-md bg-slate-50 flex items-center gap-3">
                                <img src={`${apiUrl}${existingLogo}`} alt="Current" className="h-8 w-8 object-contain" />
                                <span className="text-xs text-slate-500">Current Logo</span>
                            </div>
                        )}

                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => setLogoFile(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                <UploadCloud size={24} className="text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500">
                                    {logoFile ? logoFile.name : (isEditModalOpen ? "Click to replace logo" : "Click to upload logo")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Agreement Document {isEditModalOpen && <span className="text-xs font-normal text-slate-500">(Optional: Leave empty to keep current)</span>}
                        </label>
                        
                        {/* Current Doc Preview for Edit */}
                        {isEditModalOpen && existingDoc && !docFile && (
                            <div className="mb-2 p-2 border border-slate-200 rounded-md bg-slate-50 flex items-center gap-3">
                                <FileText size={16} className="text-blue-500" />
                                <span className="text-xs text-slate-500">Current Document Available</span>
                            </div>
                        )}

                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                             <input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={e => setDocFile(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                             <div className="flex flex-col items-center justify-center pointer-events-none">
                                <FileText size={24} className="text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500">
                                    {docFile ? docFile.name : (isEditModalOpen ? "Click to replace document" : "Click to upload document")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {isEditModalOpen ? 'Update Sponsor' : 'Save Sponsor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
