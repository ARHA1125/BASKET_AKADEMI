'use client';

import { Level } from '@/types/curriculum';
import Cookies from 'js-cookie';
import { AlertTriangle, CheckCircle2, Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
const FUT_WEIGHT_OPTIONS = [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2];

const hasValidWeight = (weight?: number) => typeof weight === 'number' && Number.isFinite(weight) && weight > 0;

const hasMetadata = (material: { competencyKey?: string; statDomain?: string; statWeight?: number; curriculumProfiles?: string[] }) => {
  return Boolean(
    material.competencyKey?.trim() &&
    material.statDomain?.trim() &&
    hasValidWeight(material.statWeight) &&
    material.curriculumProfiles?.length,
  );
};

const Badge = ({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'success' | 'warning' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tone]}`}>{children}</span>;
};

export default function CurriculumMetadataAuditView() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [profileFilter, setProfileFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/academic/curriculum-levels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setLevels(await res.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const materials = useMemo(() => {
    return levels.flatMap((level) =>
      level.months.flatMap((month) =>
        month.weekMaterials.map((material) => ({
          ...material,
          levelName: level.name,
          monthNumber: month.monthNumber,
          hasMetadata: hasMetadata(material),
        })),
      ),
    );
  }, [levels]);

  const coverage = useMemo(() => {
    const total = materials.length;
    const complete = materials.filter((item) => item.hasMetadata).length;
    return total > 0 ? Math.round((complete / total) * 100) : 0;
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();
    return materials.filter((material) => {
      const matchesSearch =
        !query ||
        material.levelName.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query) ||
        material.materialDescription.toLowerCase().includes(query) ||
        (material.competencyKey || '').toLowerCase().includes(query);

      const matchesReview = !reviewOnly || !material.hasMetadata;
      const matchesDomain = domainFilter === 'ALL' || material.statDomain === domainFilter;
      const matchesProfile = profileFilter === 'ALL' || (material.curriculumProfiles || []).includes(profileFilter);

      return matchesSearch && matchesReview && matchesDomain && matchesProfile;
    });
  }, [materials, search, reviewOnly, domainFilter, profileFilter]);

  const updateMaterial = async (materialId: string, payload: Partial<{ competencyKey: string; statDomain: string; statWeight: number; curriculumProfiles: string[] }>) => {
    try {
      setSavingId(materialId);
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/academic/curriculum-week-materials/${materialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update curriculum metadata');
      }

      toast.success('Metadata updated');

      const refresh = await fetch(`${apiUrl}/academic/curriculum-levels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refresh.ok) {
        setLevels(await refresh.json());
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update metadata');
    } finally {
      setSavingId(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllFiltered = () => {
    const ids = filteredMaterials.map((item) => item.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids])));
  };

  const bulkUpdate = async (payload: Partial<{ statDomain: string; statWeight: number; curriculumProfiles: string[] }>) => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one row first');
      return;
    }

    try {
      setSavingId('bulk');
      await Promise.all(selectedIds.map((id) => updateMaterial(id, payload)));
      toast.success('Bulk metadata update complete');
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      toast.error('Bulk update failed');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm text-slate-500 dark:text-slate-400">Metadata Coverage</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{coverage}%</div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Curriculum materials with competency key, stat domain, weight, and profiles.</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm text-slate-500 dark:text-slate-400">Fully Mapped</div>
          <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{materials.filter((item) => item.hasMetadata).length}</div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Materials ready for consistent FUT scoring.</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm text-slate-500 dark:text-slate-400">Needs Review</div>
          <div className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{materials.filter((item) => !item.hasMetadata).length}</div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Materials still relying on inference or missing metadata.</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Curriculum Metadata Audit</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review FUT mapping quality and edit anything that needs correction in the builder tab.</p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, competency, level..."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="ALL">All domains</option>
            <option value="SPD">SPD</option>
            <option value="SHO">SHO</option>
            <option value="PAS">PAS</option>
            <option value="DRI">DRI</option>
            <option value="DEF">DEF</option>
            <option value="PHY">PHY</option>
            <option value="CHR">CHR</option>
          </select>
          <select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="ALL">All profiles</option>
            <option value="KU-10">KU10 Fundamental Core</option>
            <option value="KU-12">KU12 Fundamental Full</option>
            <option value="KU-14">KU14 Intermediate</option>
            <option value="KU-17">KU17 Advanced</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <input type="checkbox" checked={reviewOnly} onChange={(e) => setReviewOnly(e.target.checked)} />
            Needs review only
          </label>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/40">
          <span className="font-medium text-slate-700 dark:text-slate-300">Selected:</span>
          <Badge>{selectedIds.length} rows</Badge>
          <button onClick={() => bulkUpdate({ statDomain: 'SPD' })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Set SPD</button>
          <button onClick={() => bulkUpdate({ statDomain: 'SHO' })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Set SHO</button>
          <button onClick={() => bulkUpdate({ statDomain: 'PAS' })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Set PAS</button>
          <button onClick={() => bulkUpdate({ statDomain: 'DRI' })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Set DRI</button>
          <button onClick={() => bulkUpdate({ statDomain: 'DEF' })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Set DEF</button>
          <button onClick={() => bulkUpdate({ statDomain: 'PHY' })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Set PHY</button>
          <button onClick={() => bulkUpdate({ statWeight: 1 })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Weight 1.00</button>
          <button onClick={() => bulkUpdate({ statWeight: 1.15 })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Weight 1.15</button>
          <button onClick={() => bulkUpdate({ curriculumProfiles: ['KU-10', 'KU-12'] })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Fundamental</button>
          <button onClick={() => bulkUpdate({ curriculumProfiles: ['KU-14'] })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Intermediate</button>
          <button onClick={() => bulkUpdate({ curriculumProfiles: ['KU-17'] })} disabled={savingId === 'bulk'} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800">Advanced</button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading curriculum metadata audit...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={filteredMaterials.length > 0 && filteredMaterials.every((item) => selectedIds.includes(item.id))}
                      onChange={toggleSelectAllFiltered}
                    />
                  </th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Month/Week</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Competency</th>
                  <th className="px-3 py-2">Stat</th>
                  <th className="px-3 py-2">Weight</th>
                  <th className="px-3 py-2">Profiles</th>
                  <th className="px-3 py-2">Audit</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selectedIds.includes(material.id)} onChange={() => toggleSelected(material.id)} />
                    </td>
                    <td className="px-3 py-3">{material.levelName}</td>
                    <td className="px-3 py-3">M{material.monthNumber} · W{material.weekNumber}</td>
                    <td className="px-3 py-3">{material.category}</td>
                    <td className="px-3 py-3">{material.competencyKey || '-'}</td>
                    <td className="px-3 py-3">
                      <select
                        value={material.statDomain || 'CHR'}
                        onChange={(e) => updateMaterial(material.id, { statDomain: e.target.value })}
                        disabled={savingId === material.id}
                        className="rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="SPD">SPD</option>
                        <option value="SHO">SHO</option>
                        <option value="PAS">PAS</option>
                        <option value="DRI">DRI</option>
                        <option value="DEF">DEF</option>
                        <option value="PHY">PHY</option>
                        <option value="CHR">CHR</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={String(material.statWeight ?? 1)}
                        onChange={(e) => updateMaterial(material.id, { statWeight: Number(e.target.value) })}
                        disabled={savingId === material.id}
                        className="rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {FUT_WEIGHT_OPTIONS.map((weight) => (
                          <option key={weight} value={weight}>{weight.toFixed(2)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="mb-2 flex flex-wrap gap-1">
                        {(material.curriculumProfiles || []).map((profile) => (
                          <Badge key={profile}>{profile.replace(/_/g, ' ')}</Badge>
                        ))}
                        {!material.curriculumProfiles?.length && <Badge tone="warning">No Profiles</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => updateMaterial(material.id, { curriculumProfiles: ['KU-10', 'KU-12'] })} disabled={savingId === material.id} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Fundamental</button>
                        <button onClick={() => updateMaterial(material.id, { curriculumProfiles: ['KU-14'] })} disabled={savingId === material.id} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Intermediate</button>
                        <button onClick={() => updateMaterial(material.id, { curriculumProfiles: ['KU-17'] })} disabled={savingId === material.id} className="rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Advanced</button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {material.hasMetadata ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={14} />
                          Ready
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={14} />
                          Review
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredMaterials.length && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={9}>No curriculum materials available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Settings2 size={16} />
          Review Workflow
        </div>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Use this table to identify materials relying on inference.</li>
          <li>Open the builder tab to edit any incorrect `statDomain`, `statWeight`, or `curriculumProfiles` mapping.</li>
          <li>Re-run coach assessments only when major curriculum mapping changes affect FUT interpretation.</li>
        </ol>
      </div>
    </div>
  );
}
