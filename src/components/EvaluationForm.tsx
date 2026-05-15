"use client"

import React, { useState } from 'react'
import * as ReactHookForm from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { evaluationSchema, type EvaluationInput } from '../lib/validations'
import { createEvaluation } from '../actions/evaluations'
import Select from './ui/Select'
import Slider from './ui/Slider'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import { prisma } from '@/lib/prisma'

type ScoreRow = {
  key: string
  label: string
  scoreMode?: 'ytn' | 'three'
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  )
}

function ScoreTable({
  title,
  rows,
  register,
  scoreOptions = ['1', '2', '3'],
}: {
  title: string
  rows: ScoreRow[]
  register: any
  scoreOptions?: string[]
}) {
  return (
    <div className="space-y-3">
      <SectionTitle title={title} />
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-center">Ya</th>
              <th className="p-3 text-center">Tidak</th>
              <th className="p-3 text-center">Markah</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t align-top">
                <td className="p-3">{row.label}</td>
                <td className="p-3 text-center">
                  <input type="radio" value="Ya" {...register(`${row.key}.answer`)} />
                </td>
                <td className="p-3 text-center">
                  <input type="radio" value="Tidak" {...register(`${row.key}.answer`)} />
                </td>
                <td className="p-3 text-center">
                  <Select {...register(`${row.key}.mark`)} className="mx-auto w-24">
                    <option value="">-</option>
                    {scoreOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ThreeMarkTable({
  title,
  rows,
  register,
}: {
  title: string
  rows: ScoreRow[]
  register: any
}) {
  return (
    <div className="space-y-3">
      <SectionTitle title={title} subtitle="Pilih satu markah untuk setiap item." />
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-center">1</th>
              <th className="p-3 text-center">2</th>
              <th className="p-3 text-center">3</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t align-top">
                <td className="p-3">{row.label}</td>
                {['1', '2', '3'].map((value) => (
                  <td key={value} className="p-3 text-center">
                    <input type="radio" value={value} {...register(row.key)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProieksiMarkTable({
  title,
  rows,
  register,
}: {
  title: string
  rows: ScoreRow[]
  register: any
}) {
  return (
    <div className="space-y-3">
      <SectionTitle title={title} subtitle="Markah 1-4 untuk setiap projeksi (sehingga 3 percubaan)." />
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-center">Projeksi 1</th>
              <th className="p-3 text-center">Projeksi 2</th>
              <th className="p-3 text-center">Projeksi 3</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t align-top">
                <td className="p-3 text-xs">{row.label}</td>
                {['1', '2', '3'].map((proj) => (
                  <td key={proj} className="p-3">
                    <Select {...register(`${row.key}.proj${proj}`)} className="w-full text-xs">
                      <option value="">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </Select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type EvaluationFormProps = {
  students: Array<any>
  evaluationId?: string
  defaultValues?: Record<string, any>
  accessMode?: 'primary' | 'secondary' | 'admin' | 'view'
}

import { auth } from '@clerk/nextjs/server'
import { UserRole } from '@prisma/client'
import { getOrCreatePortalUser } from '@/lib/auth-user'

export default async function EvaluationForm({ students, evaluationId, defaultValues, accessMode = 'view' }: EvaluationFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [step, setStep] = useState<number>(1)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isSavingSection, setIsSavingSection] = useState(false)

  const { userId } = auth()

  // Fetch only the specific evaluation and the user context
  const [evaluation, currentUser] = await Promise.all([
    prisma.evaluation.findUnique({ 
      where: { id: evaluationId }, 
      include: { student: true, assessor: true } 
    }),
    userId ? getOrCreatePortalUser(userId) : Promise.resolve(null),
  ])

  if (!evaluation) return <div className="p-6">Evaluation not found.</div>

  const sections = [
    'Maklumat Pesakit',
    'Borang Permintaan',
    'Persediaan Bilik dan Peralatan',
    'Jagaan Awal Pesakit',
    'Prosedur Radiografi',
    'Penilaian Radiograf Oleh Pelatih',
    'Jagaan Pesakit Semasa dan Selepas',
    'Ulasan Am',
    'Penilai Kedua Summary',
    'Piawan Imej Oleh Penilai',
    'Discussion / Perbincangan',
    'Final Result',
  ]

  const { register, handleSubmit, watch, reset, setValue, getValues, formState } = (ReactHookForm as any).useForm({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      positioningScore: 5,
      exposureRating: 'OPTIMAL',
      patientType: {},
      ...defaultValues,
    },
  })

  const clinicalFeedback = watch('clinicalFeedback') || ''
  const positioningScore = watch('positioningScore') || 5
  const errors = formState.errors || {}
  const editableSections =
    accessMode === 'admin'
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      : accessMode === 'primary'
        ? [1, 2, 3, 4, 5, 6, 7, 8]
        : accessMode === 'secondary'
          ? [9, 10, 11, 12]
          : []
  const canEditCurrentStep = editableSections.includes(step)

  const sectionMapping = {
    1: { field: 'maklumatPesakitData', name: 'Maklumat Pesakit' },
    2: { field: 'borangPermintaanData', name: 'Borang Permintaan' },
    3: { field: 'bilikDanPeralatanData', name: 'Persediaan Bilik & Peralatan' },
    4: { field: 'jagaanAwalData', name: 'Jagaan Awal Pesakit' },
    5: { field: 'prosedurData', name: 'Prosedur Radiografi' },
    6: { field: 'radiografData', name: 'Penilaian Radiograf Oleh Pelatih' },
    7: { field: 'selepasData', name: 'Jagaan Pesakit Semasa & Selepas' },
    8: { field: 'ulasanAmData', name: 'Ulasan Am' },
    9: { field: 'penilaiKeduaData', name: 'Penilai Kedua Summary' },
    10: { field: 'piawanImejData', name: 'Piawan Imej Oleh Penilai' },
    11: { field: 'discussionData', name: 'Discussion' },
    12: { field: 'finalResultData', name: 'Final Result' },
  }

  async function onSaveSection() {
    if (!evaluationId) {
      setServerError('Cannot save section without evaluation ID')
      return
    }

    setIsSavingSection(true)
    setServerError(null)
    setSaveMessage(null)

    try {
      const data = withComputedTotals(getValues())
      const sectionInfo = sectionMapping[step as keyof typeof sectionMapping]
      
      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          section: step,
          isPartialSave: true,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result?.success) {
        setServerError(JSON.stringify(result?.error || result?.errors || 'Failed to save section'))
        setIsSavingSection(false)
        return
      }

      setSaveMessage(`✓ ${sectionInfo.name} saved successfully`)
      setIsSavingSection(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (e: any) {
      setServerError(e.message || String(e))
      setIsSavingSection(false)
    }
  }

  async function onSubmit(data: EvaluationInput) {
    setServerError(null)
    setSuccessId(null)
    try {
      const dataWithTotals = withComputedTotals(data)

      if (evaluationId) {
        const response = await fetch(`/api/evaluations/${evaluationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: dataWithTotals,
            isPartialSave: false,
          }),
        })

        const result = await response.json()
        if (!response.ok || !result?.success) {
          setServerError(JSON.stringify(result?.error || result?.errors || 'Failed to update evaluation'))
          return
        }

        setSuccessId(result.id ?? evaluationId)
        return
      }

      const res = await createEvaluation(dataWithTotals as any)
      if (res?.success) {
        setSuccessId(res.id ?? null)
      } else {
        setServerError(JSON.stringify(res.errors || 'Unknown error'))
      }
    } catch (e: any) {
      setServerError(e.message || String(e))
    }
  }

  function next() {
    setStep((s) => Math.min(sections.length, s + 1))
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1))
  }

  async function handleDelete() {
    if (!evaluationId) return
    
    const confirmed = window.confirm('Are you sure you want to delete this evaluation? This cannot be undone.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete evaluation')
      
      // Redirect to dashboard after deletion
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error deleting evaluation:', error)
      setServerError('Failed to delete evaluation')
    }
  }

  const borangPermintaanRows = [
    { key: 'borangPermintaan.projeksi', label: 'Mengetahui projeksi yang perlu diambil.' },
    { key: 'borangPermintaan.indikasi', label: 'Memahami indikasi klinikal.' },
    { key: 'borangPermintaan.radiografLama', label: 'Memikirkan pandangan radiograf lama / laporan.' },
    { key: 'borangPermintaan.tandatanganDoktor', label: 'Menyemak adanya tandatangan doktor.' },
    { key: 'borangPermintaan.kehamilan', label: 'Menyemak borang bagi kehamilan dan status perlindungan pesakit.' },
  ]

  const bilikDanPeralatanRows = [
    { key: 'bilikDanPeralatan.kebersihan', label: 'Memerhatikan kebersihan bilik.' },
    { key: 'bilikDanPeralatan.sediakanPeralatan', label: 'Menyediakan peralatan untuk pemeriksaan.' },
    { key: 'bilikDanPeralatan.kaset', label: 'Menentukan semua kaset yang diperlukan ada.' },
    { key: 'bilikDanPeralatan.dedahan', label: 'Menetapkan faktor dedahan yang sesuai.' },
    { key: 'bilikDanPeralatan.protection', label: 'Menyediakan peralatan perlindungan dan aksesori.' },
  ]

  const jagaanAwalRows = [
    { key: 'jagaanAwal.sambutPesakit', label: 'Menyambut pesakit dengan betul.' },
    { key: 'jagaanAwal.identifikasi', label: 'Memastikan identifikasi pesakit.' },
    { key: 'jagaanAwal.arahan', label: 'Memberi arahan yang jelas kepada pesakit.' },
    { key: 'jagaanAwal.kawasan', label: 'Memastikan kawasan pemeriksaan bebas dari opasiti dan disediakan dengan betul.' },
    { key: 'jagaanAwal.semakKawasan', label: 'Menyemak dengan pesakit mengenai kawasan yang betul dengan pesakit.' },
  ]

  const prosedurRows = [
    { key: 'prosedur.posisiPesakit', label: 'Memposisikan pesakit dengan betul.' },
    { key: 'prosedur.posisiFilem', label: 'Memposisikan filem dengan betul.' },
    { key: 'prosedur.arahSinar', label: 'Mengarah alur sinar-X dengan betul.' },
    { key: 'prosedur.titikPemusatan', label: 'Menentukan titik pemusatan dengan tepat.' },
    { key: 'prosedur.kolimasi', label: 'Mengkolimasikan alur sinar-X dengan betul.' },
    { key: 'prosedur.penanda', label: 'Menempatkan penanda dan legenda dengan betul.' },
    { key: 'prosedur.panelKawalan', label: 'Memilih set panel kawalan dengan betul.' },
    { key: 'prosedur.arahanPesakit', label: 'Memberi arahan yang jelas kepada pesakit (pernafasan dan pergerakan).' },
    { key: 'prosedur.imobilasi', label: 'Mengamalkan teknik cegah gerak / stabilisasi pesakit / penggunaan imobilasi dengan betul.' },
    { key: 'prosedur.perlindunganPesakit', label: 'Mengamalkan perlindungan sinaran bagi pesakit.' },
    { key: 'prosedur.perlindunganKakitangan', label: 'Mengamalkan perlindungan sinaran bagi kakitangan dan lain-lain.' },
    { key: 'prosedur.alatAksesori', label: 'Menggunakan peralatan dan aksesori yang betul.' },
    { key: 'prosedur.memerhatiPesakit', label: 'Memerhatikan pesakit semasa dedahan.' },
    { key: 'prosedur.semakDedahan', label: 'Menyemak dedahan telah berlaku.' },
  ]

  const radiografRows = [
    { key: 'radiograf.identifikasi', label: 'Identifikasi.' },
    { key: 'radiograf.penanda', label: 'Penanda dan penempatannya.' },
    { key: 'radiograf.kawasanDedahan', label: 'Kawasan dedahan atas radiograf.' },
    { key: 'radiograf.projeksi', label: 'Projeksi.' },
    { key: 'radiograf.kolimasi', label: 'Kolimasi.' },
    { key: 'radiograf.kontras', label: 'Kontras, densiti dan ketajaman.' },
    { key: 'radiograf.artifak', label: 'Kesilapan / artifak.' },
    { key: 'radiograf.variasiAnatomikal', label: 'Variasi anatomikal.' },
    { key: 'radiograf.perluUlang', label: 'Perlu ulang.' },
    { key: 'radiograf.projeksiTambahan', label: 'Perlu untuk projeksi tambahan.' },
  ]

  const selepasRows = [
    { key: 'selepas.temaniPesakit', label: 'Menemani pesakit ke dalam bilik dan ke posisi yang diperlukan.' },
    { key: 'selepas.bantuNaikTurun', label: 'Membantu pesakit naik atau turun meja.' },
    { key: 'selepas.posisiPrihatin', label: 'Memposisi pesakit dengan keprihatinan dan keselesaan.' },
    { key: 'selepas.keselamatan', label: 'Memberi jagaan dan perhatian kepada keselamatan pesakit.' },
    { key: 'selepas.komunikasi', label: 'Sentiasa berkomunikasi dengan pesakit.' },
    { key: 'selepas.maklumat', label: 'Memberi maklumat tepat kepada pesakit.' },
    { key: 'selepas.mengemas', label: 'Membersih dan mengemas bilik selepas pesakit keluar.' },
  ]

  const ulasanAmRows = [
    { key: 'ulasanAm.kes', label: 'Kes dibantu.' },
    { key: 'ulasanAm.kesulitan', label: 'Menghadapi kesulitan.' },
    { key: 'ulasanAm.ulang', label: 'Pemeriksaan perlu diulang.' },
    { key: 'ulasanAm.fahamUlangan', label: 'Pelatih tahu sebab ulangan diperlukan.' },
  ]

  function parseMark(value: any, max: number) {
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return 0
    return Math.min(Math.max(numeric, 0), max)
  }

  const checklistPenilaiSatuScore = parseMark(watch('penilaiKedua.checklistPenilaiSatuScore'), 40)

  const piawaianIdentifikasi = parseMark(watch('piawanImej.identifikasi'), 2)
  const piawaianPenanda = parseMark(watch('piawanImej.penanda'), 2)
  const piawaianKawasanDedahan = parseMark(watch('piawanImej.kawasanDedahan'), 2)
  const piawaianProjeksi = parseMark(watch('piawanImej.projeksi'), 8)
  const piawaianKolimasi = parseMark(watch('piawanImej.kolimasi'), 4)
  const piawaianKontras = parseMark(watch('piawanImej.kontras'), 8)
  const piawaianJumlah =
    piawaianIdentifikasi +
    piawaianPenanda +
    piawaianKawasanDedahan +
    piawaianProjeksi +
    piawaianKolimasi +
    piawaianKontras

  const discussionJustifikasi = parseMark(watch('discussion.justifikasiRasional'), 5)
  const discussionFaktor = parseMark(watch('discussion.pemilihanFaktorDedahan'), 10)
  const discussionKritikal = parseMark(watch('discussion.penilaianKritikal'), 10)
  const discussionMasalah = parseMark(watch('discussion.masalahDanAtasi'), 5)
  const discussionJumlah = discussionJustifikasi + discussionFaktor + discussionKritikal + discussionMasalah

  const overallMark = checklistPenilaiSatuScore + piawaianJumlah + discussionJumlah
  const finalDecision = overallMark >= 50 ? 'PASS' : 'FAILED'

  function withComputedTotals(rawData: any) {
    return {
      ...rawData,
      penilaiKedua: {
        ...(rawData?.penilaiKedua || {}),
        checklistPenilaiSatuScore,
        piawaianRadiografScore: piawaianJumlah,
        perbincanganScore: discussionJumlah,
        jumlahBesar: overallMark,
      },
      piawanImej: {
        ...(rawData?.piawanImej || {}),
        jumlah: piawaianJumlah,
      },
      discussion: {
        ...(rawData?.discussion || {}),
        jumlah: discussionJumlah,
      },
      finalResult: {
        ...(rawData?.finalResult || {}),
        passMark: 50,
        overallMark,
        decision: finalDecision,
      },
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((section, index) => {
            const item = index + 1
            const active = step === item
            const done = step > item

            return (
              <button
                key={section}
                type="button"
                onClick={() => setStep(item)}
                className={`min-w-[180px] text-left rounded-lg px-3 py-2 border transition ${
                  active
                    ? 'bg-[#175cc5] text-white border-[#175cc5]'
                    : done
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wide opacity-80">Section {item}</div>
                <div className="text-xs font-medium truncate">{section}</div>
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border shadow-sm">
        {serverError ? <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded mb-4">{serverError}</div> : null}
        {!canEditCurrentStep ? (
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded mb-4 text-sm">
            This section is read-only for your assessor role.
          </div>
        ) : null}
        {successId ? (
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded mb-4">
            Evaluation saved. ID: {successId}
            <button type="button" onClick={() => { setSuccessId(null); setStep(1); reset() }} className="ml-3 underline">Submit another</button>
          </div>
        ) : null}

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SectionTitle title="Maklumat Pesakit" subtitle="Maklumat asas borang penilaian klinikal." />
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 font-medium">Student</label>
                    {evaluation.student ? (
                    <input
                      type="text"
                      value={evaluation.student.name}
                      readOnly
                      className="w-full rounded border px-3 py-2 bg-gray-100"
                    />
                    ) : (
                      <Select {...register('studentId')}>
                        <option value="">Select student</option>
                        {students.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name} - {s.studentId}
                          </option>
                        ))}
                      </Select>
                    )}            
                  {errors.studentId?.message ? <p className="text-xs text-red-600 mt-1">{String(errors.studentId.message)}</p> : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Nama pelatih</label>
                    <input {...register('namaPelatih')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">JXP</label>
                    <input {...register('jxp')} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Tahun</label>
                    <input {...register('tahun')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Semester</label>
                    <input {...register('semester')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Kumpulan</label>
                    <input {...register('kumpulan')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Bilik X-ray/Wad</label>
                    <input {...register('bilikXrayWad')} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Pemeriksaan dinilai</label>
                    <input {...register('pemeriksaanDinilai')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Kekerapan penilaian kawasan yang sama</label>
                    <Select {...register('kekerapanPenilaian')}>
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Nombor pendaftaran</label>
                    <input {...register('nomborPendaftaran')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Kawasan pemeriksaan</label>
                    <input {...register('kawasanPemeriksaan')} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Indikasi klinikal</label>
                    <input {...register('indikasiKlinikal')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Umur</label>
                    <input {...register('umur')} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">Jantina</label>
                    <Select {...register('jantina')}>
                      <option value="">Select</option>
                      <option value="Lelaki">Lelaki</option>
                      <option value="Wanita">Wanita</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Jenis pesakit</label>
                    <div className="space-y-1 rounded border p-3">
                      <label className="flex items-center gap-2"><input type="checkbox" {...register('patientType.berjalan')} className="accent-[#175cc5]" /> Berjalan</label>
                      <label className="flex items-center gap-2"><input type="checkbox" {...register('patientType.berkerusiRoda')} className="accent-[#175cc5]" /> Berkerusi roda</label>
                      <label className="flex items-center gap-2"><input type="checkbox" {...register('patientType.troliKatil')} className="accent-[#175cc5]" /> Troli/Katil</label>
                      <label className="flex items-center gap-2"><input type="checkbox" {...register('patientType.geriatik')} className="accent-[#175cc5]" /> Geriatik</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SectionTitle title="Ringkasan borang" subtitle="Medan ini meniru blok atas borang Excel." />
              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                <div><span className="font-medium">Nama pelatih:</span> {watch('namaPelatih') || '-'}</div>
                <div><span className="font-medium">Pemeriksaan:</span> {watch('pemeriksaanDinilai') || '-'}</div>
                <div><span className="font-medium">Kawasan:</span> {watch('kawasanPemeriksaan') || '-'}</div>
                <div><span className="font-medium">Jantina:</span> {watch('jantina') || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <ScoreTable title="1. Borang Permintaan" rows={borangPermintaanRows} register={register} />
        )}

        {step === 3 && (
          <ScoreTable title="2. Persediaan Bilik dan Peralatan" rows={bilikDanPeralatanRows} register={register} />
        )}

        {step === 4 && (
          <ScoreTable title="3. Jagaan Awal Pesakit" rows={jagaanAwalRows} register={register} />
        )}

        {step === 5 && (
          <div className="space-y-6">
            <SectionTitle title="4. Prosedur Radiografi" subtitle="Penilaian untuk setiap projeksi (sehingga 3 percubaan). Markah: 1-4." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProieksiMarkTable
                  title="Penilaian teknik"
                  rows={prosedurRows.slice(0, 8)}
                  register={register}
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-slate-50 space-y-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium">kVp</label>
                    <input {...register('prosedur.kvp')} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">mAs</label>
                    <input {...register('prosedur.mas')} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>
                <ProieksiMarkTable
                  title="Keselamatan dan pengendalian"
                  rows={prosedurRows.slice(8)}
                  register={register}
                />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <ThreeMarkTable title="5. Penilaian Radiograf Oleh Pelatih" rows={radiografRows} register={register} />
        )}

        {step === 7 && (
          <ScoreTable title="6. Jagaan Pesakit Semasa dan Selepas Radiografi" rows={selepasRows} register={register} />
        )}

        {step === 8 && (
          <div className="space-y-4">
            <SectionTitle title="7. Ulasan Am" subtitle="Tanda SATU sahaja kotak yang sesuai di atas." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left">Item</th>
                        <th className="p-3 text-center">Pilihan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Kes dibantu</td>
                        <td className="p-3">
                          <Select {...register('ulasanAm.kesPilihan')}>
                            <option value="">Select</option>
                            <option value="dibantu">Kes dibantu</option>
                            <option value="nasihat">Nasihat diberi</option>
                            <option value="tiada">Tiada bantuan langsung</option>
                          </Select>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Menghadapi kesulitan</td>
                        <td className="p-3">
                          <Select {...register('ulasanAm.kesulitanPilihan')}>
                            <option value="">Select</option>
                            <option value="ya">Ya</option>
                            <option value="tidak">Tidak</option>
                            <option value="naberkenaan">Tidak berkenaan</option>
                          </Select>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Pemeriksaan perlu diulang</td>
                        <td className="p-3">
                          <Select {...register('ulasanAm.ulangPilihan')}>
                            <option value="">Select</option>
                            <option value="ya">Ya</option>
                            <option value="tidak">Tidak</option>
                          </Select>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Pelatih tahu sebab ulangan diperlukan</td>
                        <td className="p-3">
                          <Select {...register('ulasanAm.fahamUlanganPilihan')}>
                            <option value="">Select</option>
                            <option value="ya">Ya</option>
                            <option value="tidak">Tidak</option>
                          </Select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Jika ya, nyatakan kesulitan / sebab</label>
                  <Textarea rows={4} {...register('ulasanAm.komentar')} />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Komen lain</label>
                <Textarea rows={10} {...register('clinicalFeedback')} maxLength={2000} />
                <div className="mt-1 text-xs text-slate-500">{clinicalFeedback.length}/2000 characters</div>
                {errors.clinicalFeedback?.message ? <p className="text-xs text-red-600 mt-1">{String(errors.clinicalFeedback.message)}</p> : null}
              </div>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-4">
            <SectionTitle title="9. Senarai Semak Penilai Kedua" subtitle="Markah ringkasan mengikut borang penilai kedua." />
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Komponen</th>
                    <th className="p-3 text-center">Markah</th>
                    <th className="p-3 text-center">Maksimum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">a) Senarai semak Penilai 1 (Juru X-Ray)</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        step="0.5"
                        {...register('penilaiKedua.checklistPenilaiSatuScore')}
                        className="w-24 rounded border px-2 py-1 text-center"
                      />
                    </td>
                    <td className="p-3 text-center">/40</td>
                  </tr>
                  <tr className="border-t bg-slate-50/60">
                    <td className="p-3">b) Piawaian Radiograf</td>
                    <td className="p-3 text-center font-medium">{piawaianJumlah.toFixed(1)}</td>
                    <td className="p-3 text-center">/30</td>
                  </tr>
                  <tr className="border-t bg-slate-50/60">
                    <td className="p-3">c) Perbincangan</td>
                    <td className="p-3 text-center font-medium">{discussionJumlah.toFixed(1)}</td>
                    <td className="p-3 text-center">/30</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">Markah (b) dan (c) dikira automatik daripada Section 10 dan 11.</p>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-4">
            <SectionTitle title="10. Piawaian Radiograf" subtitle="Isi markah mengikut pecahan pada borang (jumlah /30)." />
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-center">Markah</th>
                    <th className="p-3 text-center">Maksimum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">a) Identifikasi</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={2} step="0.5" {...register('piawanImej.identifikasi')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/2</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">b) Penanda dan penempatannya</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={2} step="0.5" {...register('piawanImej.penanda')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/2</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">c) Kawasan dedahan atas radiograf</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={2} step="0.5" {...register('piawanImej.kawasanDedahan')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/2</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">d) Projeksi</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={8} step="0.5" {...register('piawanImej.projeksi')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/8</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">e) Kolimasi</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={4} step="0.5" {...register('piawanImej.kolimasi')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/4</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">f) Kontras, densiti dan ketajaman</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={8} step="0.5" {...register('piawanImej.kontras')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/8</td>
                  </tr>
                  <tr className="border-t bg-slate-50 font-semibold">
                    <td className="p-3">Jumlah</td>
                    <td className="p-3 text-center">{piawaianJumlah.toFixed(1)}</td>
                    <td className="p-3 text-center">/30</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 11 && (
          <div className="space-y-4">
            <SectionTitle title="11. Perbincangan" subtitle="Isi markah mengikut pecahan pada borang (jumlah /30)." />
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-center">Markah</th>
                    <th className="p-3 text-center">Maksimum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">a) Justifikasi/rasional pemeriksaan dan projeksi diambil</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={5} step="0.5" {...register('discussion.justifikasiRasional')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/5</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">b) Pemilihan faktor dedahan dan sebab</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={10} step="0.5" {...register('discussion.pemilihanFaktorDedahan')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/10</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">c) Penilaian kritikal radiograf dan patologi</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={10} step="0.5" {...register('discussion.penilaianKritikal')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/10</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">d) Masalah yang dihadapi dan bagaimana diatasi</td>
                    <td className="p-3 text-center"><input type="number" min={0} max={5} step="0.5" {...register('discussion.masalahDanAtasi')} className="w-24 rounded border px-2 py-1 text-center" /></td>
                    <td className="p-3 text-center">/5</td>
                  </tr>
                  <tr className="border-t bg-slate-50 font-semibold">
                    <td className="p-3">Jumlah</td>
                    <td className="p-3 text-center">{discussionJumlah.toFixed(1)}</td>
                    <td className="p-3 text-center">/30</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Catatan Perbincangan (optional)</label>
              <Textarea rows={5} {...register('discussion.catatan')} placeholder="Catatan tambahan oleh penilai kedua..." />
            </div>
          </div>
        )}

        {step === 12 && (
          <div className="space-y-4">
            <SectionTitle title="12. Final Result" subtitle="Markah lulus ialah 50%. Keputusan dikira automatik." />

            <div className="rounded-lg border overflow-hidden max-w-2xl">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-medium">a) Senarai semak Penilai 1</td>
                    <td className="p-3 text-right">{checklistPenilaiSatuScore.toFixed(1)} / 40</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">b) Piawaian Radiograf</td>
                    <td className="p-3 text-right">{piawaianJumlah.toFixed(1)} / 30</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">c) Perbincangan</td>
                    <td className="p-3 text-right">{discussionJumlah.toFixed(1)} / 30</td>
                  </tr>
                  <tr className="border-t bg-slate-50 font-semibold">
                    <td className="p-3">Jumlah Besar</td>
                    <td className="p-3 text-right">{overallMark.toFixed(1)} / 100</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`rounded-xl border p-6 max-w-sm ${
              finalDecision === 'PASS'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <div className="text-xs uppercase tracking-wide">Decision (Pass Mark: 50%)</div>
              <div className="text-3xl font-bold mt-1">{finalDecision}</div>
              <div className="text-sm mt-1">
                {finalDecision === 'PASS'
                  ? `Overall marks ${overallMark.toFixed(1)}% is above or equal to 50%.`
                  : `Overall marks ${overallMark.toFixed(1)}% is below 50%.`}
              </div>
            </div>
          </div>
        )}

        {saveMessage ? (
          <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
            {saveMessage}
          </div>
        ) : null}

        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={prev} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">
                Back
              </button>
            ) : null}
            {evaluationId && accessMode === 'admin' ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            {evaluationId && canEditCurrentStep ? (
              <button
                type="button"
                onClick={onSaveSection}
                disabled={isSavingSection || formState.isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {isSavingSection ? 'Saving...' : 'Save Section'}
              </button>
            ) : null}
            {step < sections.length ? (
              <button type="button" onClick={next} className="px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md">
                Next
              </button>
            ) : evaluationId && canEditCurrentStep ? (
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? 'Saving...' : 'Save & Finish'}
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  )
}
