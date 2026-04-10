import { InvoiceStatusBadge } from "@/components/ui/admin/InvoiceStatusBadge"
import { ProofViewerModal } from "@/components/ui/admin/ProofViewerModal"
import { SwipeableVerificationModal } from "@/components/ui/admin/SwipeableVerificationModal"
import { useBilling } from "@/hooks/use-billing"
import { useDeliveryMonitor } from "@/hooks/use-delivery-monitor"
import {
  InvoiceCheckAction,
  InvoiceCheckItem,
} from "@/types/invoices"
import { UniqueAmountDisplay } from "@/utils/formatUniqueAmount"
import Cookies from "js-cookie"
import {
  Banknote,
  CheckCircle,
  CreditCard,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { Badge, Card, formatIDR, Title } from "./Common"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu"

export default function BillingView() {
  const [activeTab, setActiveTab] = useState<"current" | "history">("current")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showManualLateScheduleModal, setShowManualLateScheduleModal] =
    useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [swipeableModalOpen, setSwipeableModalOpen] = useState(false)
  const [verificationStartIndex, setVerificationStartIndex] = useState(0)
  const [filterStatus, setFilterStatus] = useState<
    "all" | "unpaid" | "pending" | "verified"
  >("all")
  const [selectedMonth, setSelectedMonth] = useState<number | "">("")
  const [selectedYear, setSelectedYear] = useState<number | "">("")
  const [showInvoiceCheckModal, setShowInvoiceCheckModal] = useState(false)
  const [invoiceCheckFilter, setInvoiceCheckFilter] = useState<
    "all" | "missing-current" | "missing-late" | "missing-both" | "unsent"
  >("all")
  const [selectedInvoiceCheckParentIds, setSelectedInvoiceCheckParentIds] =
    useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    invoices,
    loading,
    scheduleDay,
    scheduleTime,
    saveSchedule,
    reminderScheduleDay,
    reminderScheduleTime,
    saveReminderSchedule,
    manualLateTargetMonth,
    manualLateTargetYear,
    manualLateExecutionDay,
    manualLateExecutionTime,
    manualLateIsActive,
    saveManualLateSchedule,
    manualGenerate,
    deleteInvoice,
    deleteAllInvoices,
    sendManualReminders,
    invoiceCheckItems,
    invoiceCheckLoading,
    fetchInvoiceCheck,
    executeInvoiceCheckOne,
    executeInvoiceCheckBulk,
    refreshInvoices,
  } = useBilling(
    activeTab,
    selectedMonth || undefined,
    selectedYear || undefined,
  )
  const { overview: deliveryOverview } = useDeliveryMonitor()

  const [selectedTime, setSelectedTime] = useState(scheduleTime)
  const [selectedDay, setSelectedDay] = useState(scheduleDay)

  const [showReminderScheduleModal, setShowReminderScheduleModal] =
    useState(false)
  const [selectedReminderTime, setSelectedReminderTime] =
    useState(reminderScheduleTime)
  const [selectedReminderDay, setSelectedReminderDay] =
    useState(reminderScheduleDay)
  const [selectedManualLateTargetMonth, setSelectedManualLateTargetMonth] =
    useState<number>(manualLateTargetMonth || todayMonth())
  const [selectedManualLateTargetYear, setSelectedManualLateTargetYear] =
    useState<number>(manualLateTargetYear || new Date().getFullYear())
  const [selectedManualLateExecutionTime, setSelectedManualLateExecutionTime] =
    useState(manualLateExecutionTime || "00:00")
  const [selectedManualLateExecutionDay, setSelectedManualLateExecutionDay] =
    useState<number>(manualLateExecutionDay || 1)
  const [selectedManualLateIsActive, setSelectedManualLateIsActive] =
    useState(manualLateIsActive)

  useEffect(() => {
    if (scheduleTime) setSelectedTime(scheduleTime)
    if (scheduleDay) setSelectedDay(scheduleDay)
    if (reminderScheduleTime) setSelectedReminderTime(reminderScheduleTime)
    if (reminderScheduleDay) setSelectedReminderDay(reminderScheduleDay)
    if (manualLateTargetMonth)
      setSelectedManualLateTargetMonth(manualLateTargetMonth)
    if (manualLateTargetYear)
      setSelectedManualLateTargetYear(manualLateTargetYear)
    if (manualLateExecutionTime)
      setSelectedManualLateExecutionTime(manualLateExecutionTime)
    if (manualLateExecutionDay)
      setSelectedManualLateExecutionDay(manualLateExecutionDay)
    setSelectedManualLateIsActive(manualLateIsActive)
  }, [
    scheduleTime,
    scheduleDay,
    reminderScheduleTime,
    reminderScheduleDay,
    manualLateTargetMonth,
    manualLateTargetYear,
    manualLateExecutionTime,
    manualLateExecutionDay,
    manualLateIsActive,
  ])

  function todayMonth() {
    return new Date().getMonth() + 1
  }

  const runningKinds = (deliveryOverview?.activeByKind || [])
    .filter((item) => item.isRunning)
    .map((item) => item.kind)
  const batchWarning = runningKinds.length
    ? `Batch aktif saat ini: ${runningKinds.join(", ")}. Pastikan batch sebelumnya sudah sesuai sebelum menjalankan batch baru.`
    : null

  const handleSaveSchedule = async () => {
    await saveSchedule(selectedDay, selectedTime)
    setShowScheduleModal(false)
    toast.success("Jadwal Diperbarui", {
      description: `Pembuatan otomatis dijadwalkan pada tanggal ${selectedDay} pukul ${selectedTime} setiap bulannya.`,
    })
  }

  const handleSaveReminderSchedule = async () => {
    await saveReminderSchedule(selectedReminderDay, selectedReminderTime)
    setShowReminderScheduleModal(false)
    toast.success("Jadwal Pengingat Diperbarui", {
      description: `Pengingat otomatis dijadwalkan pada tanggal ${selectedReminderDay} pukul ${selectedReminderTime} setiap bulannya.`,
    })
  }

  const handleSaveManualLateSchedule = async () => {
    const result = await saveManualLateSchedule({
      targetMonth: selectedManualLateTargetMonth,
      targetYear: selectedManualLateTargetYear,
      executionDay: selectedManualLateExecutionDay,
      executionTime: selectedManualLateExecutionTime,
      isActive: selectedManualLateIsActive,
    })
    setShowManualLateScheduleModal(false)
    toast.success("Manual Late Invoice Diperbarui", {
      description: selectedManualLateIsActive
        ? `Invoice ${new Date(selectedManualLateTargetYear, selectedManualLateTargetMonth - 1, 1).toLocaleString("id-ID", { month: "long", year: "numeric" })} langsung dibuat setelah simpan. Total dibuat ${result.generated ?? 0}, total antre kirim ${result.queued ?? 0}.`
        : "Konfigurasi manual late invoice disimpan, tetapi invoice tidak dibuat karena checklist belum dicentang.",
    })
  }

  const handleGenerateNow = async () => {
    toast("Pembuatan Tagihan Manual", {
      description:
        `${batchWarning ? `${batchWarning} ` : ""}Apakah Anda yakin? Hal ini dapat membuat tagihan ganda jika dieksekusi secara tidak tepat.`,
      action: {
        label: "Konfirmasi",
        onClick: () => {
          const promise = manualGenerate()
          toast.promise(promise, {
            loading: "Membuat Tagihan...",
            success: "Tagihan berhasil dibuat!",
            error: "Gagal membuat tagihan",
          })
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: Infinity,
    })
  }

  const handleSendManual = async () => {
    toast("Kirim Pengingat WhatsApp", {
      description:
        `${batchWarning ? `${batchWarning} ` : ""}Kirim pengingat WhatsApp ke semua tagihan bulan ini yang statusnya tertunda?`,
      action: {
        label: "Kirim",
        onClick: () => {
          const promise = sendManualReminders()
          toast.promise(promise, {
            loading: "Mengirim Pengingat...",
            success: (data: any) => `Berhasil mengirim ${data.sent} pengingat!`,
            error: "Gagal mengirim pengingat",
          })
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: Infinity,
    })
  }

  const handleDelete = (id: string) => {
    toast("Hapus Tagihan", {
      description:
        "Apakah Anda yakin ingin menghapus tagihan ini? Tindakan ini tidak dapat dibatalkan.",
      action: {
        label: "Hapus",
        onClick: () => {
          const promise = deleteInvoice(id)
          toast.promise(promise, {
            loading: "Menghapus...",
            success: "Tagihan berhasil dihapus",
            error: "Gagal menghapus tagihan",
          })
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: Infinity,
    })
  }

  const handleDeleteAll = () => {
    toast(
      `Hapus Semua Tagihan ${activeTab === "current" ? "Aktif" : "Riwayat"}`,
      {
        description:
          "Apakah Anda yakin ingin menghapus semua tagihan ini? Tindakan ini tidak dapat dibatalkan.",
        action: {
          label: "Hapus Semua",
          onClick: () => {
            const promise = deleteAllInvoices()
            toast.promise(promise, {
              loading: "Menghapus semua...",
              success: "Semua tagihan berhasil dihapus",
              error: "Gagal menghapus tagihan",
            })
          },
        },
        cancel: {
          label: "Batal",
          onClick: () => {},
        },
        duration: Infinity,
      },
    )
  }

  const handleVerify = async (
    invoiceId: string,
    paymentMethod: "TRANSFER" | "CASH",
    paidAmount?: number,
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"
      const adminId = localStorage.getItem("userId") || "admin"
      const token = Cookies.get("auth_token")

      if (!token) {
        toast.error("Unauthorized: Please login again")
        return
      }

      const response = await fetch(
        `${apiUrl}/payment-module/verify/${invoiceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminId, paymentMethod, paidAmount }),
        },
      )

      if (response.ok) {
        toast.success("Pembayaran berhasil diverifikasi!")
        refreshInvoices()
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }))
        console.error("Verification failed:", response.status, errorData)
        throw new Error(
          `Verification failed: ${errorData.message || response.statusText}`,
        )
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memverifikasi pembayaran",
      )
    }
  }

  const handleViewProof = (invoice: any) => {
    setSelectedInvoice(invoice)
    setModalOpen(true)
  }

  const handleOpenSwipeableModal = (startIndex: number) => {
    setVerificationStartIndex(startIndex)
    setSwipeableModalOpen(true)
  }

  const formatInvoiceCheckResult = (result: {
    generatedCurrent?: number
    queuedCurrent?: number
    generatedManualLate?: number
    queuedManualLate?: number
  }) => {
    const parts = [
      result.generatedCurrent
        ? `${result.generatedCurrent} current generated`
        : null,
      result.queuedCurrent ? `${result.queuedCurrent} current queued` : null,
      result.generatedManualLate
        ? `${result.generatedManualLate} late generated`
        : null,
      result.queuedManualLate
        ? `${result.queuedManualLate} late queued`
        : null,
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(" • ") : "Tidak ada perubahan"
  }

  const handleOpenInvoiceCheck = async () => {
    const promise = fetchInvoiceCheck().then((items) => {
      setSelectedInvoiceCheckParentIds([])
      setShowInvoiceCheckModal(true)
      return items
    })

    toast.promise(promise, {
      loading: "Memeriksa invoice yang tertinggal...",
      success: (items) => `${items.length} parent perlu tindakan`,
      error: (error) =>
        error instanceof Error ? error.message : "Gagal memeriksa invoice",
    })
  }

  const executeInvoiceCheckAction = async (
    parentId: string,
    currentAction: InvoiceCheckAction,
    manualLateAction: InvoiceCheckAction,
    loadingLabel: string,
  ) => {
    const promise = executeInvoiceCheckOne(
      parentId,
      currentAction,
      manualLateAction,
    )

    toast.promise(promise, {
      loading: loadingLabel,
      success: (result) => formatInvoiceCheckResult(result),
      error: (error) =>
        error instanceof Error ? error.message : "Aksi invoice gagal",
    })

    return promise
  }

  const executeInvoiceCheckBulkAction = async (
    parentIds: string[],
    currentAction: InvoiceCheckAction,
    manualLateAction: InvoiceCheckAction,
    loadingLabel: string,
  ) => {
    const promise = executeInvoiceCheckBulk(
      parentIds,
      currentAction,
      manualLateAction,
    )

    toast.promise(promise, {
      loading: loadingLabel,
      success: (result) => formatInvoiceCheckResult(result),
      error: (error) =>
        error instanceof Error ? error.message : "Aksi bulk invoice gagal",
    })

    return promise
  }

  const toggleInvoiceCheckSelection = (parentId: string) => {
    setSelectedInvoiceCheckParentIds((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId],
    )
  }

  const today = new Date()
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate()
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  const monthName = today.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })
  const targetMonthLabel =
    manualLateTargetMonth && manualLateTargetYear
      ? new Date(
          manualLateTargetYear,
          manualLateTargetMonth - 1,
          1,
        ).toLocaleString("id-ID", { month: "long", year: "numeric" })
      : "-"
  const manualExecutionSummary = manualLateExecutionDay
    ? `Tanggal ${manualLateExecutionDay} pukul ${manualLateExecutionTime}`
    : "Belum dikonfigurasi"
  const manualYears = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i,
  )

  // Calculate stats based on current tab's invoices
  const stats = {
    total: (invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0),
    verified: (invoices || []).filter((inv) => inv.isVerified).length,
    pending: (invoices || []).filter((inv) => inv.photoUrl && !inv.isVerified)
      .length,
    unpaid: (invoices || []).filter((inv) => !inv.photoUrl && !inv.isVerified)
      .length,
  }

  const verifiableInvoices = invoices.filter(
    (inv) => inv.photoUrl && !inv.isVerified,
  )

  const filteredInvoiceCheckItems = invoiceCheckItems.filter((item) => {
    const missingCurrent = item.current.status === "MISSING"
    const missingLate = item.manualLate.status === "MISSING"
    const unsentAny =
      item.current.status === "EXISTS_UNSENT" ||
      item.manualLate.status === "EXISTS_UNSENT"

    if (invoiceCheckFilter === "missing-current") return missingCurrent
    if (invoiceCheckFilter === "missing-late") return missingLate
    if (invoiceCheckFilter === "missing-both") return missingCurrent && missingLate
    if (invoiceCheckFilter === "unsent") return unsentAny
    return true
  })

  const allVisibleInvoiceCheckParentIds = filteredInvoiceCheckItems.map(
    (item) => item.parentId,
  )
  const invoiceCheckMissingCurrentCount = invoiceCheckItems.filter(
    (item) => item.current.status === "MISSING",
  ).length
  const invoiceCheckMissingLateCount = invoiceCheckItems.filter(
    (item) => item.manualLate.status === "MISSING",
  ).length
  const invoiceCheckUnsentCount = invoiceCheckItems.filter(
    (item) =>
      item.current.status === "EXISTS_UNSENT" ||
      item.manualLate.status === "EXISTS_UNSENT",
  ).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-200 md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Pembuatan Tagihan Otomatis
              </h3>
              <p className="mt-1 max-w-sm text-sm text-indigo-100">
                Tagihan akan dibuat secara otomatis pada tanggal{" "}
                <span className="font-bold text-white">{scheduleDay}</span>{" "}
                pukul{" "}
                <span className="font-bold text-white">{scheduleTime}</span>{" "}
                setiap bulannya.
              </p>
              <p className="mt-3 max-w-sm text-xs text-indigo-100/90">
                Manual late invoice:{" "}
                <span className="font-semibold text-white">
                  {targetMonthLabel}
                </span>{" "}
                •{" "}
                <span className="font-semibold text-white">
                  {manualExecutionSummary}
                </span>{" "}
                •{" "}
                <span className="font-semibold text-white">
                  {manualLateIsActive ? "Aktif" : "Nonaktif"}
                </span>
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <Zap size={24} className="text-yellow-300" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleGenerateNow}
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50"
            >
              Buat Sekarang
            </button>
            <button
              onClick={handleSendManual}
              className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              Kirim Manual
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="rounded-lg border border-indigo-400/30 bg-indigo-500/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500/70"
            >
              Jadwal Invoice
            </button>
            <button
              onClick={() => setShowManualLateScheduleModal(true)}
              className="rounded-lg border border-indigo-300/30 bg-indigo-500/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500/60"
            >
              Generate Late Invoices
            </button>
            <button
              onClick={handleOpenInvoiceCheck}
              className="rounded-lg border border-indigo-300/30 bg-indigo-500/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500/60"
            >
              Invoice Check
            </button>
            <button
              onClick={() => setShowReminderScheduleModal(true)}
              className="rounded-lg border border-indigo-400/30 bg-indigo-500/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500/70"
            >
              Jadwal Pengingat
            </button>
          </div>
        </Card>

        <Card>
          <Title className="mb-2">Payment Gateway</Title>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-400">
                  MD
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-50">
                    Midtrans
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    QRIS, GoPay, VA
                  </p>
                </div>
              </div>
              <Badge status="Inactive" size="sm" />
            </div>
            {/* <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">XD</div>
                    <div>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Xendit</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">Credit Cards</p>
                    </div>
                 </div>
                 <Badge status="inactive" size="sm" />
              </div> */}
          </div>
        </Card>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
            <button
              onClick={() => setActiveTab("current")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === "current" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
            >
              Invoice List
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
            >
              Riwayat
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value ? Number(e.target.value) : "")
              }
              className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">Bulan...</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value ? Number(e.target.value) : "")
              }
              className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">Tahun...</option>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {invoices.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700"
              >
                <Trash2 size={16} />
                Hapus Semua{" "}
                {activeTab === "current" ? "Invoice Aktif" : "Riwayat"}
              </button>
            )}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari siswa..."
                className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                  <Filter size={18} />
                  {filterStatus !== "all" && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Saring Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  <div className="flex w-full items-center justify-between">
                    <span>Semua Tagihan ({invoices.length})</span>
                    {filterStatus === "all" && (
                      <CheckCircle size={16} className="text-indigo-600" />
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("unpaid")}>
                  <div className="flex w-full items-center justify-between">
                    <span>Belum Bayar ({stats.unpaid})</span>
                    {filterStatus === "unpaid" && (
                      <CheckCircle size={16} className="text-indigo-600" />
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                  <div className="flex w-full items-center justify-between">
                    <span>Menunggu Verifikasi ({stats.pending})</span>
                    {filterStatus === "pending" && (
                      <CheckCircle size={16} className="text-indigo-600" />
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("verified")}>
                  <div className="flex w-full items-center justify-between">
                    <span>Terverifikasi ({stats.verified})</span>
                    {filterStatus === "verified" && (
                      <CheckCircle size={16} className="text-indigo-600" />
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto scroll-smooth border-b border-slate-100 bg-slate-50/50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            onClick={() => setFilterStatus("all")}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              filterStatus === "all"
                ? "border-slate-200 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                : "border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            Semua Tagihan
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                filterStatus === "all"
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-800/80"
              }`}
            >
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("unpaid")}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              filterStatus === "unpaid"
                ? "border-rose-200 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            Belum Bayar
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                filterStatus === "unpaid"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-800/80"
              }`}
            >
              {stats.unpaid}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("pending")}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              filterStatus === "pending"
                ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            Menunggu Verifikasi
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                filterStatus === "pending"
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-800/80"
              }`}
            >
              {stats.pending}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("verified")}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              filterStatus === "verified"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            Terverifikasi
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                filterStatus === "verified"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-800/80"
              }`}
            >
              {stats.verified}
            </span>
          </button>
        </div>
        <div className="min-h-[300px] overflow-x-auto">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
              <Loader2 className="mr-2 animate-spin" /> Memuat data tagihan...
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <p>
                Tidak ada tagihan yang sesuai dengan pencarian tab {activeTab}.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">ID Tagihan</th>
                  <th className="px-6 py-3">Nama Siswa</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Nominal</th>
                  <th className="px-6 py-3">Bukti</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices
                  .filter((inv) => {
                    if (filterStatus === "all") return true
                    if (filterStatus === "verified") return inv.isVerified
                    if (filterStatus === "pending")
                      return inv.photoUrl && !inv.isVerified
                    if (filterStatus === "unpaid")
                      return !inv.photoUrl && !inv.isVerified
                    return true
                  })
                  .map((inv) => (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-3 font-mono text-sm text-slate-500 dark:text-slate-400">
                        #{inv.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-slate-50">
                        {inv.student}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {inv.category}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {inv.date}
                      </td>
                      <td className="px-6 py-3">
                        <div className="space-y-1">
                          {inv.uniqueCode ? (
                            <>
                              <UniqueAmountDisplay
                                baseAmount={inv.amount}
                                uniqueCode={inv.uniqueCode}
                                size="sm"
                              />
                              {inv.paymentMethod && (
                                <div className="flex items-center gap-1">
                                  {inv.paymentMethod === "CASH" ? (
                                    <Banknote
                                      size={12}
                                      className="text-emerald-600"
                                    />
                                  ) : (
                                    <CreditCard
                                      size={12}
                                      className="text-indigo-600"
                                    />
                                  )}
                                  <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                                    {inv.paymentMethod}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                              {formatIDR(inv.amount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {inv.photoUrl ? (
                          <CheckCircle className="text-emerald-500" size={20} />
                        ) : (
                          <XCircle className="text-slate-300" size={20} />
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <InvoiceStatusBadge invoice={inv} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                              <MoreHorizontal size={18} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                (window.location.href = `/invoice/${inv.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Rincian Tagihan
                            </DropdownMenuItem>

                            {inv.photoUrl && (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer text-blue-600 dark:text-blue-400"
                                  onClick={() => handleViewProof(inv)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Bukti Transfer
                                </DropdownMenuItem>
                                {!inv.isVerified && (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                                    onClick={() => {
                                      const invoiceIndex =
                                        verifiableInvoices.findIndex(
                                          (i) => i.id === inv.id,
                                        )
                                      handleOpenSwipeableModal(invoiceIndex)
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verifikasi
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/20"
                              onClick={() => handleDelete(inv.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showScheduleModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <Title>Konfigurasi Jadwal</Title>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {monthName}
                </span>

                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="rounded border-none bg-slate-100 p-1 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih tanggal untuk mengatur pembuatan tagihan otomatis secara
                  bulanan.
                </p>

                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-bold uppercase text-slate-400"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const isToday = day === today.getDate()

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`flex aspect-square items-center justify-center rounded-full text-xs font-medium transition-all ${
                            day === selectedDay
                              ? "bg-indigo-600 text-white shadow-md"
                              : isToday
                                ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    },
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full bg-indigo-600"></span>
                    <span>Akan Dieksekusi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full border border-indigo-500 bg-indigo-100 dark:bg-indigo-900/50"></span>
                    <span>Hari Ini</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveSchedule}
                  className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showReminderScheduleModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <Title>Jadwal Pengingat Tagihan</Title>
                <button
                  onClick={() => setShowReminderScheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {monthName}
                </span>

                <input
                  type="time"
                  value={selectedReminderTime}
                  onChange={(e) => setSelectedReminderTime(e.target.value)}
                  className="rounded border-none bg-slate-100 p-1 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih tanggal untuk mengirim otomatis pesan pengingat tagihan
                  (via WhatsApp) jika tagihan belum lunas lebih dari 7 hari.
                </p>

                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-bold uppercase text-slate-400"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-rem-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const isToday = day === today.getDate()

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedReminderDay(day)}
                          className={`flex aspect-square items-center justify-center rounded-full text-xs font-medium transition-all ${
                            day === selectedReminderDay
                              ? "bg-orange-500 text-white shadow-md"
                              : isToday
                                ? "bg-orange-100 text-orange-700 ring-1 ring-orange-500 dark:bg-orange-900/50 dark:text-orange-300"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    },
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>Akan Dieksekusi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full border border-orange-500 bg-orange-100 dark:bg-orange-900/50"></span>
                    <span>Hari Ini</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveReminderSchedule}
                  className="mt-4 w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  Simpan Jadwal Pengingat
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showManualLateScheduleModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <Title>Generate Late Invoices</Title>
                <button
                  onClick={() => setShowManualLateScheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gunakan fitur ini untuk membuat ulang invoice bulan lalu atau
                  bulan tertentu. Invoice akan dibuat sesuai bulan target dan
                  dikirim otomatis dengan pola antrian seperti broadcast.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Bulan Invoice
                    </span>
                    <select
                      value={selectedManualLateTargetMonth}
                      onChange={(e) =>
                        setSelectedManualLateTargetMonth(Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString("id-ID", {
                              month: "long",
                            })}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Tahun Invoice
                    </span>
                    <select
                      value={selectedManualLateTargetYear}
                      onChange={(e) =>
                        setSelectedManualLateTargetYear(Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    >
                      {manualYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 items-end gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Tanggal Invoice
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={selectedManualLateExecutionDay}
                      onChange={(e) =>
                        setSelectedManualLateExecutionDay(
                          Number(e.target.value),
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    />
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Jam Invoice
                    </span>
                    <input
                      type="time"
                      value={selectedManualLateExecutionTime}
                      onChange={(e) =>
                        setSelectedManualLateExecutionTime(e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    />
                  </label>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200/70 bg-amber-50/70 px-3 py-3 dark:border-amber-800/60 dark:bg-amber-900/10">
                  <input
                    type="checkbox"
                    checked={selectedManualLateIsActive}
                    onChange={(e) =>
                      setSelectedManualLateIsActive(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Aktifkan manual generate
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Jika checklist dicentang lalu Anda klik simpan, invoice
                      langsung dibuat dan dikirim otomatis. Jika checklist tidak
                      dicentang, sistem hanya menyimpan tanggal dan jam invoice
                      tanpa menjalankan generate.
                    </p>
                  </div>
                </label>

                <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                  <p>
                    <span className="font-semibold">Invoice target:</span>{" "}
                    {new Date(
                      selectedManualLateTargetYear,
                      selectedManualLateTargetMonth - 1,
                      1,
                    ).toLocaleString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <span className="font-semibold">Timestamp invoice:</span>{" "}
                    tanggal {selectedManualLateExecutionDay} pukul{" "}
                    {selectedManualLateExecutionTime}
                  </p>
                </div>

                <button
                  onClick={handleSaveManualLateSchedule}
                  className="mt-2 w-full rounded-lg bg-amber-500 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                >
                  Simpan Manual Late Invoice
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showInvoiceCheckModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-in zoom-in-95 w-full max-w-6xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <Title>Invoice Check</Title>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Deteksi parent aktif yang belum punya invoice current month,
                    manual late, atau invoice yang sudah ada tapi belum terkirim.
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoiceCheckModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Missing Current
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {invoiceCheckMissingCurrentCount}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Missing Late
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {invoiceCheckMissingLateCount}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Existing Unsent
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {invoiceCheckUnsentCount}
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {[
                  { value: "all", label: "Semua" },
                  { value: "missing-current", label: "Missing Current" },
                  { value: "missing-late", label: "Missing Late" },
                  { value: "missing-both", label: "Missing Both" },
                  { value: "unsent", label: "Unsent" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() =>
                      setInvoiceCheckFilter(
                        filter.value as
                          | "all"
                          | "missing-current"
                          | "missing-late"
                          | "missing-both"
                          | "unsent",
                      )
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      invoiceCheckFilter === filter.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedInvoiceCheckParentIds(allVisibleInvoiceCheckParentIds)
                    }
                    className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Pilih Semua Visible
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceCheckParentIds([])}
                    className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Bersihkan Pilihan
                  </button>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedInvoiceCheckParentIds.length} parent dipilih
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      executeInvoiceCheckBulkAction(
                        selectedInvoiceCheckParentIds,
                        "GENERATE",
                        "GENERATE",
                        "Generate invoice terpilih...",
                      )
                    }
                    disabled={selectedInvoiceCheckParentIds.length === 0}
                    className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Generate Selected
                  </button>
                  <button
                    onClick={() =>
                      executeInvoiceCheckBulkAction(
                        selectedInvoiceCheckParentIds,
                        "GENERATE_AND_SEND",
                        "GENERATE_AND_SEND",
                        "Generate & send invoice terpilih...",
                      )
                    }
                    disabled={selectedInvoiceCheckParentIds.length === 0}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Generate & Send Selected
                  </button>
                  <button
                    onClick={() =>
                      executeInvoiceCheckBulkAction(
                        selectedInvoiceCheckParentIds,
                        "SEND",
                        "SEND",
                        "Mengirim invoice unsent terpilih...",
                      )
                    }
                    disabled={selectedInvoiceCheckParentIds.length === 0}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send Selected Unsent
                  </button>
                </div>
              </div>

              <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                {invoiceCheckLoading ? (
                  <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Memuat data invoice checker...
                  </div>
                ) : filteredInvoiceCheckItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Tidak ada parent yang perlu tindakan pada filter ini.
                  </div>
                ) : (
                  filteredInvoiceCheckItems.map((item) => {
                    const currentMissing = item.current.status === "MISSING"
                    const manualLateMissing = item.manualLate.status === "MISSING"
                    const currentUnsent =
                      item.current.status === "EXISTS_UNSENT"
                    const manualLateUnsent =
                      item.manualLate.status === "EXISTS_UNSENT"

                    return (
                      <div
                        key={item.parentId}
                        className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedInvoiceCheckParentIds.includes(
                                item.parentId,
                              )}
                              onChange={() =>
                                toggleInvoiceCheckSelection(item.parentId)
                              }
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-50">
                                {item.parentName}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {item.phoneNumber || "Nomor telepon belum tersedia"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.activeStudentCount} siswa aktif
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <span
                              className={`rounded-full px-2 py-1 ${
                                currentMissing
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : currentUnsent
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              Current: {item.current.status}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 ${
                                manualLateMissing
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : manualLateUnsent
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              Late: {item.manualLate.status}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                            <span className="font-semibold">Current Scope:</span>{" "}
                            {item.current.label || "Tidak dikonfigurasi"}
                          </div>
                          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                            <span className="font-semibold">Manual Late Scope:</span>{" "}
                            {item.manualLate.label || "Tidak dikonfigurasi"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {currentMissing && (
                            <>
                              <button
                                onClick={() =>
                                  executeInvoiceCheckAction(
                                    item.parentId,
                                    "GENERATE",
                                    "NONE",
                                    "Generate current invoice...",
                                  )
                                }
                                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                              >
                                Generate Current
                              </button>
                              <button
                                onClick={() =>
                                  executeInvoiceCheckAction(
                                    item.parentId,
                                    "GENERATE_AND_SEND",
                                    "NONE",
                                    "Generate & send current invoice...",
                                  )
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                              >
                                Generate & Send Current
                              </button>
                            </>
                          )}

                          {manualLateMissing && (
                            <>
                              <button
                                onClick={() =>
                                  executeInvoiceCheckAction(
                                    item.parentId,
                                    "NONE",
                                    "GENERATE",
                                    "Generate late invoice...",
                                  )
                                }
                                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                              >
                                Generate Late
                              </button>
                              <button
                                onClick={() =>
                                  executeInvoiceCheckAction(
                                    item.parentId,
                                    "NONE",
                                    "GENERATE_AND_SEND",
                                    "Generate & send late invoice...",
                                  )
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                              >
                                Generate & Send Late
                              </button>
                            </>
                          )}

                          {currentMissing && manualLateMissing && (
                            <>
                              <button
                                onClick={() =>
                                  executeInvoiceCheckAction(
                                    item.parentId,
                                    "GENERATE",
                                    "GENERATE",
                                    "Generate current & late invoice...",
                                  )
                                }
                                className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                              >
                                Generate Both
                              </button>
                              <button
                                onClick={() =>
                                  executeInvoiceCheckAction(
                                    item.parentId,
                                    "GENERATE_AND_SEND",
                                    "GENERATE_AND_SEND",
                                    "Generate & send current & late invoice...",
                                  )
                                }
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                              >
                                Generate & Send Both
                              </button>
                            </>
                          )}

                          {currentUnsent && (
                            <button
                              onClick={() =>
                                executeInvoiceCheckAction(
                                  item.parentId,
                                  "SEND",
                                  "NONE",
                                  "Mengirim current invoice yang belum terkirim...",
                                )
                              }
                              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                            >
                              Send Current
                            </button>
                          )}

                          {manualLateUnsent && (
                            <button
                              onClick={() =>
                                executeInvoiceCheckAction(
                                  item.parentId,
                                  "NONE",
                                  "SEND",
                                  "Mengirim late invoice yang belum terkirim...",
                                )
                              }
                              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                            >
                              Send Late
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {selectedInvoice && (
        <ProofViewerModal
          invoice={selectedInvoice}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onVerify={handleVerify}
          apiUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}
        />
      )}

      <SwipeableVerificationModal
        invoices={verifiableInvoices}
        startIndex={verificationStartIndex}
        isOpen={swipeableModalOpen}
        onClose={() => setSwipeableModalOpen(false)}
        onVerify={handleVerify}
        apiUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}
      />
    </div>
  )
}
