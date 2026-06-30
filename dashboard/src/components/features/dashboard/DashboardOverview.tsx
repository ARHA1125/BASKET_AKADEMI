"use client";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/ui/Card";
import { PlayerCard } from "@/components/ui/admin/PlayerCard";
import { getToken } from "@/lib/auth";
import { useUser } from "@/hooks/use-user";
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Search,
  Shirt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
  ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { toast } from 'sonner';

interface DashboardOverviewProps {
  role?: 'admin' | 'coach';
}

export function DashboardOverview({ role: propRole }: DashboardOverviewProps) {
  const { user, loading: userLoading } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Resolve role: prioritize propRole, default to user.role
  const resolvedRole = (propRole || user?.role || 'ADMIN').toLowerCase();
  
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // States for Admin dashboard
  const [adminMetrics, setAdminMetrics] = useState<any[]>([]);
  const [adminTasks, setAdminTasks] = useState<any[]>([]);
  const [adminEvents, setAdminEvents] = useState<any[]>([]);
  const [adminInventory, setAdminInventory] = useState<any[]>([]);
  
  // States for 6 Admin Modules Summary
  const [adminSummary, setAdminSummary] = useState<any>({
    sponsorsCount: 0,
    eventsCount: 0,
    newsCount: 0,
    galleryCount: 0,
    curriculumLevelsCount: 0,
    assessmentsCount: 0,
    recentAssessments: [],
    wahaConnectionStatus: 'DISCONNECTED',
    totalStudentsCount: 0,
    totalParentsCount: 0,
    totalCoachesCount: 0,
    unpaidInvoicesCount: 0,
    agingARAmount: 0
  });
  
  // States for Coach dashboard
  const [coachClasses, setCoachClasses] = useState<any[]>([]);
  const [coachMetrics, setCoachMetrics] = useState<any[]>([]);
  const [coachTasks, setCoachTasks] = useState<any[]>([]);
  const [coachAttendance, setCoachAttendance] = useState<any[]>([]);
  const [coachEvents, setCoachEvents] = useState<any[]>([]);
  const [coachLeaderboard, setCoachLeaderboard] = useState<any[]>([]);
  const [coachTeamStats, setCoachTeamStats] = useState<any>(null);

  // GSAP Animations
  useGSAP(() => {
    if (loading) return;
    const tl = gsap.timeline();
    
    tl.fromTo(".gsap-header-element", 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );

    tl.fromTo(".gsap-metric-card",
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.2"
    );

    tl.fromTo(".gsap-dashboard-card",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" },
      "-=0.2"
    );
  }, { dependencies: [loading], scope: containerRef });

  // Attendance Submission handler for Coach
  const handleSaveAttendance = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Token tidak ditemukan. Silakan login kembali.");
      return;
    }
    const headers = { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    };
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3005";

    try {
      const promises = coachAttendance.map(student => {
        return fetch(`${apiBase}/academic/attendance`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            studentId: student.id,
            status: student.status,
            date: new Date()
          })
        });
      });
      
      const responses = await Promise.all(promises);
      if (responses.every(res => res.ok)) {
        toast.success("Laporan kehadiran berhasil disimpan ke database!");
        // Refresh dashboard coach tasks
        const updatedTasks = coachTasks.filter(t => t.id !== 'c-attendance');
        setCoachTasks(updatedTasks);
      } else {
        toast.error("Sebagian absensi gagal disimpan. Pastikan data benar.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghubungkan ke server untuk menyimpan absensi.");
    }
  };

  // Data Fetching
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3005";

      try {
        if (resolvedRole === 'admin') {
          // ==========================================
          // ADMIN DATA FETCHING (DYNAMIC BACKEND INTEGRATION)
          // ==========================================
          let totalRevenue = 0;
          let revenueGrowth = -100.0;
          let activeStudents = 0;
          let avgAttendance = 100.0;
          let lowStockCount = 0;
          
          let sponsorsCount = 0;
          let eventsCount = 0;
          let newsCount = 0;
          let galleryCount = 0;
          let curriculumLevelsCount = 0;
          let assessmentsCount = 0;
          let recentAssessments: any[] = [];
          let wahaConnectionStatus = 'DISCONNECTED';
          let totalStudentsCount = 0;
          let totalParentsCount = 0;
          let totalCoachesCount = 0;
          let unpaidInvoicesCount = 0;
          let agingARAmount = 0;
          
          let smartInventory: any[] = [];
          const tasks: any[] = [];

          // 1. Fetch Invoicing/Revenue Overview
          try {
            const res = await fetch(`${apiBase}/payment-module/overview`, { headers });
            if (res.ok) {
              const overview = await res.json();
              totalRevenue = overview.totalRevenue || 0;
              revenueGrowth = overview.revenueGrowth || 0;
            }
          } catch (e) {
            console.error("Failed to fetch payment overview", e);
          }

          // 2. Fetch Active Student Counts & Pending Registrations
          try {
            const res = await fetch(`${apiBase}/academic/students`, { headers });
            if (res.ok) {
              const studentRes = await res.json();
              const list = studentRes.data || studentRes || [];
              totalStudentsCount = studentRes.total ?? list.length ?? 0;
              activeStudents = studentRes.stats?.active ?? list.filter((s: any) => s.user?.status === 'Active').length ?? 0;
              
              const pendingCount = studentRes.stats?.pending ?? list.filter((s: any) => s.user?.status === 'Pending' || s.status === 'Pending').length ?? 0;
              if (pendingCount > 0) {
                tasks.push({
                  id: 'approve-students',
                  type: 'Academic',
                  title: `Persetujuan Pendaftaran: ${pendingCount} Siswa Baru`,
                  time: 'Just now',
                  urgent: false
                });
              }
            }
          } catch (e) {
            console.error("Failed to fetch students", e);
          }

          // 3. Fetch Parents Count
          try {
            const res = await fetch(`${apiBase}/academic/parents?limit=1`, { headers });
            if (res.ok) {
              const parentRes = await res.json();
              totalParentsCount = parentRes.total ?? 0;
            }
          } catch (e) {
            console.error("Failed to fetch parents", e);
          }

          // 4. Fetch Coaches Count
          try {
            const res = await fetch(`${apiBase}/academic/coaches?limit=1`, { headers });
            if (res.ok) {
              const coachRes = await res.json();
              totalCoachesCount = coachRes.total ?? 0;
            }
          } catch (e) {
            console.error("Failed to fetch coaches", e);
          }

          // 5. Fetch Attendance Summary & Calculate Overall Attendance Rate
          try {
            const res = await fetch(`${apiBase}/academic/attendance/reports/summary`, { headers });
            if (res.ok) {
              const rows = await res.json();
              const rates = rows.map((r: any) => Number(r.attendanceRate || 0));
              if (rates.length > 0) {
                avgAttendance = rates.reduce((a: number, b: number) => a + b, 0) / rates.length;
              }
            }
          } catch (e) {
            console.error("Failed to fetch attendance summary", e);
          }

          // 6. Fetch Products for Smart Inventory & Stock alerts
          try {
            const res = await fetch(`${apiBase}/marketplace/products`, { headers });
            if (res.ok) {
              const products = await res.json();
              const lowStockProducts = products.filter((p: any) => Number(p.stock) <= 5);
              lowStockCount = lowStockProducts.length;
              
              smartInventory = products.map((p: any) => ({
                id: p.id,
                name: p.name,
                stock: p.stock,
                statusText: p.stock <= 5 ? `Sisa ${p.stock} Pcs • Segera Restock` : `Sisa ${p.stock} Pcs • Aman`,
                low: p.stock <= 5
              }));

              if (lowStockCount > 0) {
                tasks.push({
                  id: 'restock-products',
                  type: 'Inventory',
                  title: `Restock ${lowStockCount} Produk Menipis`,
                  time: '1 hour ago',
                  urgent: true
                });
              }
            }
          } catch (e) {
            console.error("Failed to fetch products", e);
          }

          // 7. Fetch Pending Payments (Action Required) & Aging AR
          try {
            const res = await fetch(`${apiBase}/payment-module/invoices?filter=current`, { headers });
            if (res.ok) {
              const invoices = await res.json();
              const unpaidInvoices = invoices.filter((inv: any) => inv.status === 'unpaid');
              unpaidInvoicesCount = unpaidInvoices.length;
              agingARAmount = unpaidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

              const pendingVerification = unpaidInvoices.filter((inv: any) => inv.photoUrl);
              if (pendingVerification.length > 0) {
                tasks.push({ 
                  id: 'verify-payments', 
                  type: 'Finance', 
                  title: `Verifikasi ${pendingVerification.length} Pembayaran Manual`, 
                  time: 'Just now', 
                  urgent: true 
                });
              }
            }
          } catch (e) {
            console.error("Failed to fetch pending invoices", e);
          }

          // 8. Fetch Sponsors
          try {
            const res = await fetch(`${apiBase}/administration/sponsors`, { headers });
            if (res.ok) {
              const sponsors = await res.json();
              sponsorsCount = sponsors.length;
            }
          } catch (e) {
            console.error("Failed to fetch sponsors", e);
          }

          // 9. Fetch News
          try {
            const res = await fetch(`${apiBase}/administration/news`, { headers });
            if (res.ok) {
              const news = await res.json();
              newsCount = news.length;
            }
          } catch (e) {
            console.error("Failed to fetch news", e);
          }

          // 10. Fetch Gallery
          try {
            const res = await fetch(`${apiBase}/administration/gallery`, { headers });
            if (res.ok) {
              const gallery = await res.json();
              galleryCount = gallery.length;
            }
          } catch (e) {
            console.error("Failed to fetch gallery", e);
          }

          // 11. Fetch Curriculum Levels
          try {
            const res = await fetch(`${apiBase}/academic/curriculum-levels`, { headers });
            if (res.ok) {
              const levels = await res.json();
              curriculumLevelsCount = levels.length;
            }
          } catch (e) {
            console.error("Failed to fetch curriculum levels", e);
          }

          // 12. Fetch Assessments (FUT Cards)
          try {
            const res = await fetch(`${apiBase}/academic/assessments`, { headers });
            if (res.ok) {
              const assessments = await res.json();
              assessmentsCount = assessments.length;
              recentAssessments = assessments.slice(0, 3).map((a: any) => ({
                id: a.id,
                playerName: a.student?.user?.fullName || 'Atlet',
                assessor: a.coach?.user?.fullName || 'Coach',
                ovr: a.overallRating || 0,
                date: new Date(a.assessedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
              }));
            }
          } catch (e) {
            console.error("Failed to fetch assessments", e);
          }

          // 13. Fetch WAHA session connection status
          try {
            const res = await fetch(`${apiBase}/notifications/waha/status?session=default`, { headers });
            if (res.ok) {
              const wahaStatus = await res.json();
              wahaConnectionStatus = wahaStatus.status || 'DISCONNECTED';
            }
          } catch (e) {
            console.error("Failed to fetch waha status", e);
          }

          // 14. Fetch Upcoming Events
          let upcomingEvents = [];
          try {
            const res = await fetch(`${apiBase}/community-module/events`, { headers });
            if (res.ok) {
              const events = await res.json();
              eventsCount = events.length;
              upcomingEvents = events.slice(0, 2).map((ev: any) => ({
                id: ev.id,
                name: ev.name,
                type: ev.type,
                date: new Date(ev.date).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' }),
                location: ev.location || 'Wirabhakti Court',
                draftingStatus: ev.squads && ev.squads.length > 0 ? 'Drafting Done' : 'Drafting Open',
                rosterCount: ev.squads && ev.squads[0] ? `${ev.squads[0].players?.length || 0} Roster` : '0/15 Roster'
              }));
            }
          } catch (e) {
            console.error("Failed to fetch events", e);
          }

          // Set states
          setAdminMetrics([
            { title: 'Total Revenue (Bulanan)', value: `Rp ${Math.round(totalRevenue).toLocaleString('id-ID')}`, change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`, trend: revenueGrowth >= 0 ? 'up' : 'down', icon: Wallet, color: 'emerald' },
            { title: 'Siswa Aktif', value: String(activeStudents), change: '+8 Siswa', trend: 'up', icon: Users, color: 'blue' },
            { title: 'Rata-rata Kehadiran', value: `${avgAttendance.toFixed(1)}%`, change: '-2.1%', trend: 'down', icon: Activity, color: 'blue' },
            { title: 'Stok Menipis', value: `${lowStockCount} SKU`, change: 'Segera Restock', trend: 'neutral', icon: ShoppingBag, color: 'red' },
          ]);
          
          setAdminTasks(tasks);
          setAdminEvents(upcomingEvents);
          setAdminInventory(smartInventory.slice(0, 3));
          setAdminSummary({
            sponsorsCount,
            eventsCount,
            newsCount,
            galleryCount,
            curriculumLevelsCount,
            assessmentsCount,
            recentAssessments,
            wahaConnectionStatus,
            totalStudentsCount,
            totalParentsCount,
            totalCoachesCount,
            unpaidInvoicesCount,
            agingARAmount
          });

        } else {
          // ==========================================
          // COACH DATA FETCHING (DYNAMIC BACKEND INTEGRATION)
          // ==========================================
          let classes: any[] = [];
          try {
            const res = await fetch(`${apiBase}/academic/me/coaching-classes`, { headers });
            if (res.ok) {
              classes = await res.json();
              setCoachClasses(classes);
            }
          } catch (e) {
            console.error("Failed to fetch coaching classes", e);
          }

          let activeClass = classes[0];
          if (classes.length > 0) {
            const matched = classes.find((c: any) => c.id === selectedClassId);
            if (matched) {
              activeClass = matched;
            } else if (!selectedClassId) {
              setSelectedClassId(classes[0].id);
            }
          }

          const cohortName = activeClass?.ageClass || 'KU-16';

          // 1. Fetch Weekly Leaderboard for selected age class
          let leaderboardData: any[] = [];
          let teamStats = {
            speed: 85,
            shooting: 78,
            passing: 80,
            dribbling: 82,
            defense: 75,
            physical: 76,
            overall: 79
          };

          try {
            const res = await fetch(`${apiBase}/academic/gamification/leaderboard/weekly?ageClass=${cohortName}`, { headers });
            if (res.ok) {
              const rows = await res.json();
              leaderboardData = rows.slice(0, 3).map((r: any, idx: number) => ({
                rank: idx + 1,
                name: r.fullName,
                points: r.weeklyPoints
              }));

              if (rows.length > 0) {
                const sums = rows.reduce((acc: any, cur: any) => {
                  acc.spd += cur.speedScore || 0;
                  acc.sho += cur.shootingScore || 0;
                  acc.pas += cur.passingScore || 0;
                  acc.dri += cur.dribblingScore || 0;
                  acc.def += cur.defenseScore || 0;
                  acc.phy += cur.physicalScore || 0;
                  acc.ovr += cur.overallRating || 0;
                  return acc;
                }, { spd: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0, ovr: 0 });

                const count = rows.length;
                teamStats = {
                  speed: Math.round(sums.spd / count),
                  shooting: Math.round(sums.sho / count),
                  passing: Math.round(sums.pas / count),
                  dribbling: Math.round(sums.dri / count),
                  defense: Math.round(sums.def / count),
                  physical: Math.round(sums.phy / count),
                  overall: Math.round(sums.ovr / count)
                };
              }
            }
          } catch (e) {
            console.error("Failed to fetch weekly leaderboard", e);
          }

          // 2. Fetch Attendance Summary for class
          let classAttendance = 92.1;
          try {
            const res = await fetch(`${apiBase}/academic/attendance/reports/summary?ageClass=${cohortName}`, { headers });
            if (res.ok) {
              const rows = await res.json();
              if (rows.length > 0) {
                const sumRates = rows.reduce((acc: number, cur: any) => acc + Number(cur.attendanceRate || 0), 0);
                classAttendance = sumRates / rows.length;
              }
            }
          } catch (e) {
            console.error("Failed to fetch attendance summary for coach", e);
          }

          // 3. Fetch Upcoming Events
          let coachUpcomingEvents: any[] = [];
          try {
            const res = await fetch(`${apiBase}/community-module/events`, { headers });
            if (res.ok) {
              const events = await res.json();
              coachUpcomingEvents = events.slice(0, 2).map((ev: any) => {
                const d = new Date(ev.date);
                return {
                  id: ev.id,
                  day: d.toLocaleString('id-ID', { weekday: 'short' }),
                  num: String(d.getDate()).padStart(2, '0'),
                  name: ev.name,
                  time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
                  location: ev.location || 'Wirabhakti Court'
                };
              });
            }
          } catch (e) {
            console.error("Failed to fetch events for coach view", e);
          }

          // 4. Map roster and attendance
          const activeRoster = activeClass?.students || [];
          const attendanceList = activeRoster.map((s: any) => ({
            id: s.id,
            name: s.user?.fullName || 'Unknown Student',
            status: 'PRESENT'
          }));

          // 5. Compile Coach Action Required tasks dynamically
          const coachPendingTasks: any[] = [];
          
          // A. Search for unassessed students in this class
          try {
            const res = await fetch(`${apiBase}/academic/assessments`, { headers });
            if (res.ok) {
              const assessments = await res.json();
              const assessedStudentIds = new Set(assessments.map((a: any) => a.student?.id));
              
              const unassessed = activeRoster.filter((s: any) => !assessedStudentIds.has(s.id));
              if (unassessed.length > 0) {
                coachPendingTasks.push({
                  id: 'input-fut-card',
                  type: 'Penilaian',
                  title: `Input Nilai FUT Card: ${unassessed[0].user?.fullName || 'Siswa'}`,
                  time: '1 hour ago',
                  urgent: true
                });
              }
            }
          } catch (e) {
            console.error("Failed to fetch assessments for coach tasks", e);
          }

          // B. Add curriculum review task if available
          if (activeClass?.curriculumLevel) {
            coachPendingTasks.push({
              id: 'review-syllabus',
              type: 'Silabus',
              title: `Pelajari Silabus Level ${activeClass.curriculumLevel.name}`,
              time: 'Just now',
              urgent: false
            });
          }

          // C. Add attendance entry task
          coachPendingTasks.unshift({
            id: 'c-attendance',
            type: 'Absensi',
            title: `Input Absensi Sesi Hari ini: Kelas ${activeClass?.name || 'KU-16'}`,
            time: 'Just now',
            urgent: true
          });

          setCoachMetrics([
            { title: 'Kelas Diampu', value: `${classes.length} Kelas`, change: classes.map((c: any) => c.name).join(', ') || 'KU-10, KU-12, KU-16', trend: 'neutral', icon: Calendar, color: 'blue' },
            { title: 'Siswa Roster', value: `${activeRoster.length} Atlet`, change: '▲ +5 Roster', trend: 'up', icon: Users, color: 'blue' },
            { title: 'Kehadiran Latihan', value: `${classAttendance.toFixed(1)}%`, change: '▲ +1.5%', trend: 'up', icon: Activity, color: 'emerald' },
            { title: 'Sesi Pekan Ini', value: '8 Sesi', change: '4 Selesai • 4 Jadwal', trend: 'neutral', icon: Calendar, color: 'blue' },
          ]);

          setCoachTasks(coachPendingTasks);
          setCoachAttendance(attendanceList);
          setCoachEvents(coachUpcomingEvents);
          setCoachLeaderboard(leaderboardData);
          setCoachTeamStats(teamStats);
        }
      } catch (err) {
        console.error("General fetch error in dashboard load", err);
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      loadDashboardData();
    }
  }, [resolvedRole, selectedClassId, userLoading]);

  // Loading skeleton state
  if (userLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <header className="flex justify-between items-center mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 h-28 bg-gray-100 dark:bg-gray-900 border-0"></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
          <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN VIEW RENDERING
  // =========================================================================
  if (resolvedRole === 'admin') {
    return (
      <div ref={containerRef} className="space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="gsap-header-element">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              Dashboard Overview 
              <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">v2.1 Live</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selamat pagi, berikut adalah ringkasan operasional akademi hari ini.</p>
          </div>
          
          <div className="flex items-center gap-3 gsap-header-element">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari siswa, invoice, event..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button className="relative p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all">
              <Zap size={16} />
              Quick Action
            </button>
          </div>
        </header>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminMetrics.map((metric, index) => (
            <Card key={index} className="gsap-metric-card p-5 flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{metric.value}</h3>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' && <TrendingUp size={12} />}
                  {metric.trend === 'down' && <TrendingDown size={12} />}
                  {metric.trend === 'neutral' && <AlertTriangle size={12} />}
                  {metric.change}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-${metric.color}-600 ring-1 ring-gray-100 dark:ring-gray-700`}>
                <metric.icon size={24} className={`text-${metric.color}-500`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Col Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action Required */}
            <Card className="gsap-dashboard-card overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-blue-600" />
                  Action Required
                </h3>
                <Badge variant="blue">{adminTasks.length} Pending</Badge>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {adminTasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{task.type}</span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <span className="text-xs text-gray-400">{task.time}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900/50 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      Process
                    </button>
                  </div>
                ))}
                {adminTasks.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
                    🎉 Semua pekerjaan selesai! Tidak ada aksi yang memerlukan perhatian saat ini.
                  </div>
                )}
              </div>
            </Card>

            {/* Bento Widget 1: Administrasi & Konten Utama */}
            <Card className="gsap-dashboard-card p-5">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-emerald-500" />
                  Administrasi &amp; Konten Utama
                </h3>
                <span className="text-xs text-gray-400 font-medium">Modul Publik</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 text-center">
                  <span className="block text-2xl font-black text-gray-900 dark:text-gray-50">{adminSummary.sponsorsCount}</span>
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Sponsor Aktif</span>
                </div>
                
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 text-center">
                  <span className="block text-2xl font-black text-gray-900 dark:text-gray-50">{adminSummary.eventsCount}</span>
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Agenda Event</span>
                </div>
                
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 text-center">
                  <span className="block text-2xl font-black text-gray-900 dark:text-gray-50">{adminSummary.newsCount}</span>
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Berita/Artikel</span>
                </div>
                
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 text-center">
                  <span className="block text-2xl font-black text-gray-900 dark:text-gray-50">{adminSummary.galleryCount}</span>
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Galeri Foto</span>
                </div>
              </div>
            </Card>

            {/* Bento Widget 2: Kurikulum & Audit FUT Card */}
            <Card className="gsap-dashboard-card p-5">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-500" />
                  Kurikulum &amp; Audit FUT Card
                </h3>
                <Badge variant="blue">{adminSummary.curriculumLevelsCount} Level Master</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs bg-yellow-50 dark:bg-yellow-950/20 border border-dashed border-yellow-200 dark:border-yellow-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-600" size={16} />
                    <span className="font-bold text-gray-900 dark:text-gray-50">Total Penilaian FUT (Assessments):</span>
                  </div>
                  <strong className="text-sm font-black text-yellow-700 dark:text-yellow-400">{adminSummary.assessmentsCount} Lembar</strong>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Penilaian Terkini (FUT Audit)</h4>
                  {adminSummary.recentAssessments.map((a: any) => (
                    <div key={a.id} className="flex justify-between items-center p-2.5 border border-gray-100 dark:border-gray-800 rounded bg-white dark:bg-gray-900/50">
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-50">{a.playerName}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">Penilai: {a.assessor} • {a.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">OVR</span>
                        <strong className="text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">{a.ovr}</strong>
                      </div>
                    </div>
                  ))}
                  {adminSummary.recentAssessments.length === 0 && (
                    <div className="text-sm text-gray-400 py-2 text-center">Belum ada penilaian FUT terdaftar.</div>
                  )}
                </div>
              </div>
            </Card>

          </div>

          {/* Right Column (Col Span 1) */}
          <div className="space-y-8">
            
            {/* Bento Widget 3: WhatsApp Server Gateway Status */}
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-emerald-500" />
                WhatsApp Server Status
              </h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 mb-4">
                <div className={`w-3 h-3 rounded-full ${adminSummary.wahaConnectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div className="flex-1">
                  <span className="block text-xs font-bold text-gray-500">WAHA Session:</span>
                  <span className="block text-sm font-black text-gray-900 dark:text-gray-50 uppercase">{adminSummary.wahaConnectionStatus}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => toast.info("Membuka modul WhatsApp Server QR...")}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all"
                >
                  Scan QR / Manage Device
                </button>
              </div>
            </Card>

            {/* Bento Widget 4: Data User Rill */}
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Data User Rill
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm pb-2 border-b border-dashed border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Siswa Terdaftar</span>
                  <strong className="text-gray-900 dark:text-gray-50">{adminSummary.totalStudentsCount} Siswa</strong>
                </div>
                
                <div className="flex justify-between items-center text-sm pb-2 border-b border-dashed border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Orang Tua Terdaftar</span>
                  <strong className="text-gray-900 dark:text-gray-50">{adminSummary.totalParentsCount} Wali</strong>
                </div>

                <div className="flex justify-between items-center text-sm pb-2 border-b border-dashed border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Pelatih Terdaftar</span>
                  <strong className="text-gray-900 dark:text-gray-50">{adminSummary.totalCoachesCount} Coach</strong>
                </div>
              </div>
              <button 
                onClick={() => toast.info("Mengalihkan ke modul Data User...")}
                className="w-full mt-4 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-1.5 rounded border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:bg-gray-100"
              >
                Ke Manajemen Data User →
              </button>
            </Card>

            {/* Bento Widget 5: Billing & Invoices (Aging AR) */}
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Wallet size={18} className="text-blue-500" />
                Billing &amp; Aging AR
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-dashed border-red-200 dark:border-red-900 rounded-lg">
                  <span className="block text-xs font-bold text-red-600 dark:text-red-400">Total Piutang Berjalan (Aging AR):</span>
                  <strong className="text-lg font-black text-red-700 dark:text-red-400">Rp {adminSummary.agingARAmount.toLocaleString('id-ID')}</strong>
                  <span className="block text-[10px] text-gray-400 mt-0.5">Dari {adminSummary.unpaidInvoicesCount} invoice belum lunas</span>
                </div>
              </div>
            </Card>

            {/* Smart Inventory */}
            <Card className="gsap-dashboard-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-gray-700 dark:text-gray-400" />
                  Smart Inventory
                </h3>
              </div>
              <div className="space-y-3">
                {adminInventory.map((item, idx) => (
                  <div key={item.id || idx} className={`flex items-center gap-3 p-2 rounded-lg ${item.low ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30' : 'border border-transparent'}`}>
                    <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm text-gray-500">
                      {item.name.toLowerCase().includes('jersey') ? <Shirt size={20} className={item.low ? 'text-red-500' : 'text-gray-500'} /> : <Zap size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-50 truncate">{item.name}</p>
                      <p className={`text-xs ${item.low ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500'}`}>{item.statusText}</p>
                    </div>
                    <button className="p-1.5 bg-white dark:bg-gray-900 text-gray-500 rounded border border-gray-200 dark:border-gray-800 hover:text-blue-500">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                ))}
                {adminInventory.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-2">Belum ada data inventaris.</div>
                )}
              </div>
              <button 
                onClick={() => toast.info("Mengalihkan ke modul Marketplace...")}
                className="w-full mt-4 text-xs font-medium text-blue-600 hover:text-blue-700 text-center"
              >
                Ke Manajemen Stok →
              </button>
            </Card>

            {/* Upcoming Events */}
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {adminEvents.map((ev, idx) => (
                  <div key={ev.id || idx} className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white dark:border-gray-900"></div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">{ev.date}</p>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">{ev.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{ev.location}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="blue">{ev.draftingStatus}</Badge>
                      <span className="text-xs text-gray-400 flex items-center">{ev.rosterCount}</span>
                    </div>
                  </div>
                ))}
                {adminEvents.length === 0 && (
                  <div className="text-sm text-gray-400 py-2">Belum ada kegiatan terdaftar dalam kalender terdekat.</div>
                )}
              </div>
              <button 
                onClick={() => toast.info("Mengalihkan ke modul Events...")}
                className="w-full mt-5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
              >
                Buka Kalender Full
              </button>
            </Card>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // COACH VIEW RENDERING
  // =========================================================================
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="gsap-header-element">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            Coach Dashboard Overview
            <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">v2.1 Live</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selamat pagi Coach, kelola absensi, jadwal latihan, dan progres nilai atlet hari ini.</p>
        </div>
        
        <div className="flex items-center gap-3 gsap-header-element">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Pilih Kelas:</span>
          <div className="relative">
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm pl-4 pr-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
            >
              {coachClasses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {coachClasses.length === 0 && (
                <option value="">KU-16 A (Kelompok Umur 16)</option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {coachMetrics.map((metric, index) => (
          <Card key={index} className="gsap-metric-card p-5 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{metric.value}</h3>
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                metric.trend === 'up' ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                {metric.trend === 'up' && <TrendingUp size={12} />}
                {metric.change}
              </div>
            </div>
            <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-blue-600 ring-1 ring-gray-100 dark:ring-gray-700`}>
              <metric.icon size={24} className="text-blue-500" />
            </div>
          </Card>
        ))}
      </div>

      {/* Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Action Required */}
          <Card className="gsap-dashboard-card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-600" />
                ⚠️ Action Required
              </h3>
              <Badge variant="blue">{coachTasks.length} Pending</Badge>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {coachTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{task.type}</span>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-xs text-gray-400">{task.time}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Membuka modul ${task.type}...`)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900/50 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Process
                  </button>
                </div>
              ))}
              {coachTasks.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  🎉 Semua tugas selesai! Roster latihan kelas Anda hari ini aman.
                </div>
              )}
            </div>
          </Card>

          {/* Absensi Sesi Terakhir */}
          <Card className="gsap-dashboard-card p-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                ⚡ Absensi Sesi Terakhir
              </h3>
              <span className="text-xs text-gray-500 font-medium">Latihan Fisik</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coachAttendance.map((student) => (
                <div key={student.id} className="flex justify-between items-center p-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">{student.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${student.status === 'PRESENT' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : 'text-red-600 bg-red-50 dark:bg-red-950/20'}`}>
                      {student.status === 'PRESENT' ? 'Hadir' : 'Absen'}
                    </span>
                    <button 
                      onClick={() => {
                        setCoachAttendance(prev => prev.map(s => s.id === student.id ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : s));
                        toast.info(`Status ${student.name} diubah`);
                      }}
                      className={`w-8 h-4 rounded-full relative transition-colors ${student.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${student.status === 'PRESENT' ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>
              ))}
              {coachAttendance.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-2 col-span-2">Roster kelas tidak terdeteksi atau kosong.</div>
              )}
            </div>
            {coachAttendance.length > 0 && (
              <button 
                onClick={handleSaveAttendance}
                className="w-full mt-5 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm hover:shadow transition-all"
              >
                Simpan &amp; Kirim Laporan Kehadiran
              </button>
            )}
          </Card>

        </div>

        <div className="space-y-8">
          
          {/* Upcoming Schedule & Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            
            {/* Upcoming Schedule */}
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                📅 Upcoming Schedule
              </h3>
              <div className="space-y-4">
                {coachEvents.map((ev, idx) => (
                  <div key={ev.id || idx} className="flex gap-4 items-center">
                    <div className="w-12 h-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">{ev.day}</span>
                      <span className="text-lg font-black text-gray-900 dark:text-gray-50 -mt-1">{ev.num}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-50 truncate">{ev.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{ev.time} • {ev.location}</p>
                    </div>
                  </div>
                ))}
                {coachEvents.length === 0 && (
                  <div className="text-sm text-gray-400">Belum ada agenda latihan terjadwal.</div>
                )}
              </div>
              <button className="w-full mt-4 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-1.5 rounded border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:bg-gray-100">
                Buka Kalender Latihan
              </button>
            </Card>

            {/* Top Performers */}
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                🏆 Top Performers
              </h3>
              <div className="space-y-3">
                {coachLeaderboard.map((player) => (
                  <div key={player.rank} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 dark:border-gray-800 pb-2 text-gray-800 dark:text-gray-200">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      <span className="font-bold text-gray-900 dark:text-gray-50 mr-1">#{player.rank}</span> 
                      {player.name}
                    </span>
                    <strong className="text-blue-600 dark:text-blue-400">+{player.points} XP</strong>
                  </div>
                ))}
                {coachLeaderboard.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-2">Data poin leaderboard belum tersedia untuk kelas ini.</div>
                )}
              </div>
              <div className="text-center mt-3">
                <a href="#" className="text-xs text-blue-600 hover:underline font-bold">Peringkat Lengkap &gt;</a>
              </div>
            </Card>
          </div>

          {/* Team Stats Average */}
          {coachTeamStats && (
            <Card className="gsap-dashboard-card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                📊 Team Stats Average ({coachClasses.find(c => c.id === selectedClassId)?.name || 'KU-16 A'})
              </h3>
              
              <div className="space-y-3 mb-4">
                {[
                  { key: 'SPD', label: 'Speed (SPD)', val: coachTeamStats.speed },
                  { key: 'SHO', label: 'Shooting (SHO)', val: coachTeamStats.shooting },
                  { key: 'PAS', label: 'Passing (PAS)', val: coachTeamStats.passing },
                  { key: 'DRI', label: 'Dribbling (DRI)', val: coachTeamStats.dribbling },
                  { key: 'DEF', label: 'Defense (DEF)', val: coachTeamStats.defense },
                  { key: 'PHY', label: 'Physical (PHY)', val: coachTeamStats.physical },
                ].map((stat) => (
                  <div key={stat.key}>
                    <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      <span>{stat.label}</span>
                      <span>{stat.val}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${stat.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Team Average OVR:</span>
                <strong className="text-xl font-black text-gray-900 dark:text-gray-50">{coachTeamStats.overall}</strong>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
