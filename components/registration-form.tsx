'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import * as htmlToImage from 'html-to-image';
import { FormInput } from './form-input';
import { FormSelect } from './form-select';
import {
  validateFormStep1,
  validateFormStep2,
  validateFormStep3,
  RegistrationFormData,
  FormErrors,
} from '@/lib/validation';
import { saveFormData, getFormData, saveSubmission, clearFormData } from '@/lib/storage';

const STEPS = [
  { number: 1, title: 'Informasi Pribadi', description: 'Isi data diri Anda' },
  { number: 2, title: 'Detail Kompetisi', description: 'Pilih kategori lomba' },
  { number: 3, title: 'Metrik Fisik', description: 'Ukuran fisik atlet' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

const COMPETITION_OPTIONS = [
  { value: 'kyorugi', label: 'Kyorugi (Tanding)' },
  { value: 'poomsae', label: 'Poomsae (Jurus)' },
];

const BELT_COLOR_OPTIONS = [
  { value: 'putih', label: 'Putih' },
  { value: 'kuning', label: 'Kuning' },
  { value: 'kuning-strip', label: 'Kuning Strip' },
  { value: 'hijau', label: 'Hijau' },
  { value: 'hijau-strip', label: 'Hijau Strip' },
  { value: 'biru', label: 'Biru' },
  { value: 'biru-strip', label: 'Biru Strip' },
  { value: 'merah', label: 'Merah' },
  { value: 'merah-strip-1', label: 'Merah Strip I' },
  { value: 'merah-strip-2', label: 'Merah Strip II' },
  { value: 'dan', label: 'DAN (Sabuk Hitam)' },
];

const CLASS_CATEGORY_OPTIONS = [
  { value: 'prestasi', label: 'Prestasi' },
  { value: 'pemula', label: 'Pemula' },
];

export const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const championshipIdFromParams = params?.championshipId as string || '';

  const [formData, setFormData] = useState<RegistrationFormData>({
    championshipId: championshipIdFromParams,
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    dojang: '',
    competitionCategory: '',
    beltColor: '',
    classCategory: '',
    height: '',
    weight: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load URL params and saved data on mount
  useEffect(() => {
    const savedData = getFormData();
    if (Object.keys(savedData).length > 0) {
      setFormData(prev => ({ ...prev, ...savedData }));
    }

    // Capture championship ID from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const champId = params.get('championship');
      if (champId) {
        setFormData(prev => ({ ...prev, championshipId: champId }));
      }
    }
  }, []);

  // Auto-save form data
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormData(formData);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, height: value }));
      if (errors.height) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.height;
          return newErrors;
        });
      }
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, weight: value }));
      if (errors.weight) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.weight;
          return newErrors;
        });
      }
    }
  };

  const validateStep = (): boolean => {
    let stepErrors: FormErrors = {};

    if (currentStep === 1) {
      stepErrors = validateFormStep1({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        gender: formData.gender,
        dojang: formData.dojang,
      });
    } else if (currentStep === 2) {
      stepErrors = validateFormStep2({
        competitionCategory: formData.competitionCategory,
        beltColor: formData.beltColor,
        classCategory: formData.classCategory,
      });
    } else if (currentStep === 3) {
      stepErrors = validateFormStep3({
        height: formData.height,
        weight: formData.weight,
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setIsSubmitting(true);
      try {
        const payload = {
          action: 'create',
          idKejuaraan: formData.championshipId || 'General',
          nama: formData.fullName,
          gender: formData.gender === 'male' ? 'Laki-laki' : formData.gender === 'female' ? 'Perempuan' : 'Lainnya',
          sabuk: BELT_COLOR_OPTIONS.find(o => o.value === formData.beltColor)?.label || formData.beltColor,
          tempatTanggalLahir: `${formData.placeOfBirth}, ${formData.dateOfBirth}`,
          dojang: formData.dojang,
          berat: formData.weight,
          tinggi: formData.height,
          kategori: formData.competitionCategory === 'kyorugi' ? 'Kyorugi' : 'Poomsae',
          kelas: formData.classCategory === 'prestasi' ? 'Prestasi' : 'Pemula'
        };

        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyIH06rsQuNvUJINSiIEnDaJbxZUXzZIar5vL_L8AAakjIjxyDzo2EfOFzWziOYkL1/exec';

        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
        });

        const id = saveSubmission(formData);
        if (id) {
          setSubmissionId(id);
          setIsSubmitted(true);
          clearFormData();
        }
      } catch (error) {
        console.error('Submission failed:', error);
        alert('Gagal mengirim pendaftaran. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isSubmitted) {
    return <SuccessScreen submissionId={submissionId} formData={formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Progress Indicator */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between gap-1 sm:gap-2 mb-6">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 mb-2 ${currentStep >= step.number
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-border text-muted-foreground'
                    }`}
                  aria-current={currentStep === step.number ? 'step' : undefined}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-center text-foreground leading-tight">
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-0.5 sm:mx-2 transition-all duration-300 ${currentStep > step.number ? 'bg-primary' : 'bg-border'
                    }`}
                  role="presentation"
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-sm font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg py-3 px-4">
          <span className="font-bold">{STEPS[currentStep - 1].title}</span> - {STEPS[currentStep - 1].description}
        </p>
      </div>

      {/* Form Steps */}
      <div className="animate-fadeIn">
        {currentStep === 1 && (
          <div className="space-y-6">
            <FormInput
              label="Nama Lengkap"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              placeholder="Masukkan nama lengkap Anda"
              required
            />

            <FormInput
              label="Tanggal Lahir"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={errors.dateOfBirth}
              required
            />

            <FormInput
              label="Tempat Lahir"
              name="placeOfBirth"
              type="text"
              value={formData.placeOfBirth}
              onChange={handleInputChange}
              error={errors.placeOfBirth}
              placeholder="Kota, Provinsi"
              required
            />

            <FormSelect
              label="Jenis Kelamin"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={GENDER_OPTIONS}
              error={errors.gender}
              required
            />

            <FormInput
              label="Asal Dojang"
              name="dojang"
              type="text"
              value={formData.dojang}
              onChange={handleInputChange}
              error={errors.dojang}
              placeholder="Masukkan nama Dojang Anda"
              required
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <FormSelect
              label="Kategori Kompetisi"
              name="competitionCategory"
              value={formData.competitionCategory}
              onChange={handleInputChange}
              options={COMPETITION_OPTIONS}
              error={errors.competitionCategory}
              hint="Pilih antara Kyorugi (Tanding) atau Poomsae (Jurus)"
              required
            />

            <FormSelect
              label="Warna Sabuk"
              name="beltColor"
              value={formData.beltColor}
              onChange={handleInputChange}
              options={BELT_COLOR_OPTIONS}
              error={errors.beltColor}
              required
            />

            <FormSelect
              label="Kategori Kelas"
              name="classCategory"
              value={formData.classCategory}
              onChange={handleInputChange}
              options={CLASS_CATEGORY_OPTIONS}
              error={errors.classCategory}
              hint="Pilih Prestasi atau Pemula"
              required
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-semibold text-foreground">Ringkasan Pendaftaran</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium">Nama:</span>
                  <span className="text-right">{formData.fullName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-medium">Kompetisi:</span>
                  <span className="text-right">{formData.competitionCategory === 'kyorugi' ? 'Kyorugi (Tanding)' : 'Poomsae (Jurus)'}</span>
                </div>
                <div className="flex justify-between items-start mt-2">
                  <span className="font-medium">Warna Sabuk:</span>
                  <span className="text-right">{BELT_COLOR_OPTIONS.find(o => o.value === formData.beltColor)?.label}</span>
                </div>
                <div className="flex justify-between items-start mt-2">
                  <span className="font-medium">Kategori:</span>
                  <span className="text-right">{formData.classCategory === 'prestasi' ? 'Prestasi' : 'Pemula'}</span>
                </div>
                <div className="flex justify-between items-start mt-2 pt-2 border-t border-border/50">
                  <span className="font-medium">Dojang:</span>
                  <span className="text-right font-medium text-primary">{formData.dojang}</span>
                </div>
              </div>
            </div>

            <FormInput
              label="Tinggi Badan"
              name="height"
              type="text"
              inputMode="numeric"
              value={formData.height}
              onChange={handleHeightChange}
              error={errors.height}
              placeholder="Masukkan tinggi dalam cm"
              hint="Gunakan angka saja (100-230 cm)"
              required
            />

            <FormInput
              label="Berat Badan"
              name="weight"
              type="text"
              inputMode="numeric"
              value={formData.weight}
              onChange={handleWeightChange}
              error={errors.weight}
              placeholder="Masukkan berat dalam kg"
              hint="Gunakan angka saja (20-200 kg)"
              required
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-border">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-border rounded-lg font-semibold text-foreground hover:bg-muted hover:border-border/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Kembali ke langkah sebelumnya"
          >
            <span className="hidden sm:inline">Sebelumnya</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        )}

        {currentStep < STEPS.length && (
          <button
            type="button"
            onClick={handleNextStep}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 group"
            aria-label="Lanjut ke langkah berikutnya"
          >
            Lanjut
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}

        {currentStep === STEPS.length && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Kirim pendaftaran"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Daftar Sekarang</span>
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
};

interface SuccessScreenProps {
  submissionId: string | null;
  formData: RegistrationFormData;
}

const SuccessScreen = ({ submissionId, formData }: SuccessScreenProps) => {
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);

  const handleStartNew = () => {
    if (formData.championshipId) {
      window.location.href = `/${formData.championshipId}/register`;
    } else {
      window.location.href = '/';
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('ticket-container');
    if (!element) return false;

    setIsGeneratingTicket(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // High resolution for text crispness
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Rizzon-Ticket-${submissionId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (error) {
      console.error('Failed to generate ticket:', error);
      alert('Gagal membuat E-Tiket. Silakan coba lagi.');
      return false;
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  const handleWhatsApp = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const categoryLabel = formData.competitionCategory === 'kyorugi' ? 'Kyorugi (Tanding)' : 'Poomsae (Jurus)';
    const waText = `Halo Admin Rizzon, saya sudah selesai melakukan pendaftaran kejuaraan.\n\nNama: ${formData.fullName}\nKategori: ${categoryLabel}\nID Pendaftaran: ${submissionId}\n\nBerikut saya lampirkan informasi pendaftarannya. Terima kasih.`;
    const waUrl = `https://wa.me/6281315336286?text=${encodeURIComponent(waText)}`;

    // Auto-download the ticket first so the user has it ready to attach
    await handleDownload();

    // Open WhatsApp
    window.open(waUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center animate-slideInUp py-8">
      {/* Visual Identity / Header */}
      <div>
        <h2 className="text-4xl font-bold text-foreground mb-3">Pendaftaran Berhasil!</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Terima kasih telah mendaftar. Silakan unduh E-Tiket Anda di bawah ini dan konfirmasi pembayaran melalui WhatsApp.
        </p>
      </div>

      {/* The Printable E-Ticket Wrapper (handles centering, ticket-container handles exact bounds for snapshot) */}
      <div className="w-full flex justify-center">
        <div
          id="ticket-container"
          className="w-[400px] bg-card rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col items-center border border-border shrink-0"
          style={{ backgroundColor: 'white' }}
        >
          {/* Ticket Header Graphic */}
          <div className="bg-primary w-full p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent" />
            <div className="relative z-10 flex flex-col items-center text-primary-foreground">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl tracking-tight">Rizzon Taekwondo</h3>
              <p className="text-sm font-medium text-primary-foreground/80 tracking-widest uppercase mt-1">E-Ticket Kejuaraan</p>
            </div>
          </div>

          {/* Solid Divider */}
          <div className="w-full flex justify-center bg-card">
            <div className="w-[90%] border-t-2 border-dashed border-border mt-6"></div>
          </div>

          {/* Ticket Content */}
          <div className="w-full p-8 bg-card text-left">
            {submissionId && (
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">ID Pendaftaran</p>
                <p className="text-2xl font-mono font-bold text-foreground bg-muted/50 py-3 px-6 rounded-xl border border-border/50 inline-block tracking-wider">
                  {submissionId}
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Nama Atlet</p>
                <p className="font-bold text-lg text-foreground capitalize">{formData.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Kompetisi</p>
                  <p className="font-bold text-primary">{formData.competitionCategory === 'kyorugi' ? 'Kyorugi' : 'Poomsae'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Kelas</p>
                  <p className="font-bold text-foreground">{formData.classCategory === 'prestasi' ? 'Prestasi' : 'Pemula'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Tingkat Sabuk</p>
                  <p className="font-bold text-foreground">
                    {BELT_COLOR_OPTIONS.find(o => o.value === formData.beltColor)?.label?.split(' ')[0]}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Fisik</p>
                  <p className="font-bold text-foreground">{formData.height}cm / {formData.weight}kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <a
          href="#"
          onClick={handleWhatsApp}
          className="w-full px-6 py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1DA851] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20 group"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          {isGeneratingTicket ? 'Memproses...' : 'Konfirmasi via WhatsApp'}
        </a>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isGeneratingTicket}
            className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-all duration-200 flex items-center justify-center gap-2 group border border-border"
          >
            <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh E-Tiket
          </button>

          <button
            onClick={handleStartNew}
            className="flex-1 px-6 py-3 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Daftar Lagi
          </button>
        </div>
      </div>
    </div>
  );
};
