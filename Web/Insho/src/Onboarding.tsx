import { useEffect, useMemo, useState } from 'react'
import Stepper , { Step } from '@/components/Stepper.tsx'


type Props = {
  open: boolean
  defaultName?: string | null
  onClose: () => void
  onCompleted: (data: OnboardingData) => void
}

export type OnboardingData = {
  name: string
  heightCm: number | ''
  age: number | ''
  weightKg: number | ''
  gender: string
  activityLevel: string
  goals: string[]
}

const GOAL_OPTIONS = [
  { key: 'weight_loss', label: 'Gewicht abnehmen' },
  { key: 'muscle_gain', label: 'Muskeln aufbauen' },
  { key: 'endurance', label: 'Ausdauer verbessern' },
  { key: 'wellbeing', label: 'Gesundheit & Wohlbefinden' },
]

export const Onboarding = ({ open, defaultName, onClose, onCompleted }: Props) => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: defaultName || '',
    heightCm: '',
    age: '',
    weightKg: '',
    gender: '',
    activityLevel: '',
    goals: [],
  })

  useEffect(() => {
    if (open) {
      setStep(0)
      setData((d) => ({ ...d, name: defaultName || d.name }))
    }
  }, [open, defaultName])

  const canNext = useMemo(() => {
    switch (step) {
      case 0: return data.name.trim().length > 0
      case 1: return !!data.heightCm && data.heightCm > 0 && data.heightCm < 300
      case 2: return !!data.age && data.age > 0 && data.age < 120
      case 3: return !!data.weightKg && data.weightKg > 0 && data.weightKg < 500
      case 4: return data.goals.length > 0
      default: return true
    }
  }, [step, data])

  const finish = () => {
    onCompleted(data)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4">
      <div className="flex flex-col w-full max-w-lg rounded-2xl bg-[#0f1a13] text-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
          <h2 className="text-xl font-semibold">🎉 Willkommen! Lass uns starten 🚀</h2>
          <button onClick={onClose} className="rounded p-1 text-white/70 hover:bg-white/10">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 h-full">
          <Stepper
            initialStep={1}
            disableStepIndicators={true}
            onStepChange={(s) => setStep(s - 1)}
            onFinalStepCompleted={finish}
            backButtonText="Zurück"
            nextButtonText={step < 4 ? 'Weiter' : 'Fertig'}
            backButtonProps={{
              className: 'rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10',
            }}
            nextButtonProps={{
              disabled: !canNext,
              className: 'rounded-full bg-[#38E07A] px-5 py-2 text-sm font-medium text-black disabled:opacity-50',
            }}
            stepCircleContainerClassName="bg-[#0f1a13]"
            stepContainerClassName="px-2"
            contentClassName="px-0"
            footerClassName="border-white/10"
          >

            <Step>
                <div className="p-2">
                {/* Name */}
                <label className="block text-sm text-white/80">Wie heißt du?</label>
                <input
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-[#38E07A]"
                  placeholder="Dein Name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
                <p className="text-xs text-white/60">Standardmäßig ist dein vorhandener Name vorausgefüllt.</p>
                {/* Größe */}
                <label className="block text-sm text-white/80">Größe (cm)</label>
                <input
                    type="number"
                    min={50}
                    max={300}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-[#38E07A]"
                    placeholder="z. B. 178"
                    value={data.heightCm}
                    onChange={(e) => setData({ ...data, heightCm: e.target.value === '' ? '' : Number(e.target.value) })}
                />
                {/* Alter */}
                <label className="block text-sm text-white/80">Alter</label>
                <input
                    type="number"
                    min={5}
                    max={120}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-[#38E07A]"
                    placeholder="z. B. 29"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value === '' ? '' : Number(e.target.value) })}
                />
                {/* Gewicht */}
                <label className="block text-sm text-white/80">Gewicht (kg)</label>
                <input
                    type="number"
                    min={20}
                    max={500}
                    step={0.1}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-[#38E07A]"
                    placeholder="z. B. 72.5"
                    value={data.weightKg}
                    onChange={(e) => setData({ ...data, weightKg: e.target.value === '' ? '' : Number(e.target.value) })}
                />
                {/* Geschlecht */}
                <label className="block text-sm text-white/80">Geschlecht</label>
                <select
                  className="mb-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-[#38E07A]"
                  value={data.gender}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                >
                  <option value="">Bitte auswählen</option>
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                  <option value="diverse">Divers</option>
                </select>
                {/* Aktivitätsstufe */}
                <label className="block text-sm text-white/80">Aktivitätsstufe</label>
                <select
                  className="mb-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-[#38E07A]"
                  value={data.activityLevel}
                  onChange={(e) => setData({ ...data, activityLevel: e.target.value })}
                >
                  <option value="">Bitte auswählen</option>
                  <option value="sedentary">Niedrig (kaum Bewegung)</option>
                  <option value="light">Leicht aktiv (1-3x/Woche)</option>
                  <option value="moderate">Mäßig aktiv (3-5x/Woche)</option>
                  <option value="active">Sehr aktiv (6-7x/Woche)</option>
                  <option value="very_active">Extrem aktiv (körperliche Arbeit/2x täglich)</option>
                </select>

                </div>
            </Step>

            {/* Step 2: Ziele */}
            <Step>
                <label className="block text-sm text-white/80">Ziele</label>
                <div className="flex flex-col gap-2">
                  {GOAL_OPTIONS.map((opt) => {
                    const checked = data.goals.includes(opt.key)
                    return (
                      <label key={opt.key} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const goals = checked
                              ? data.goals.filter((g) => g !== opt.key)
                              : [...data.goals, opt.key]
                            setData({ ...data, goals })
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    )
                  })}
                </div>
            </Step>
              {/* Step 3: ausrechnung von kcal und anpassung und erklärung*/}
              <Step>
                  <p>baklanbdoidbf</p>
              </Step>
          </Stepper>
        </div>
      </div>
    </div>
  )
}