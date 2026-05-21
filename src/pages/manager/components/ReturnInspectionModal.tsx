import { useState } from "react";
import type { BookingItem, ReturnInspection } from "@/mocks/bookings";

interface Props {
  booking: BookingItem;
  onConfirm: (inspection: ReturnInspection) => void;
  onClose: () => void;
}

type Step = "info" | "inspection" | "damages" | "summary";

const FUEL_OPTIONS: { value: ReturnInspection["fuelLevel"]; label: string; icon: string }[] = [
  { value: "full",  label: "Plein",    icon: "ri-battery-line" },
  { value: "3/4",   label: "3/4",     icon: "ri-battery-line" },
  { value: "1/2",   label: "1/2",     icon: "ri-battery-line" },
  { value: "1/4",   label: "1/4",     icon: "ri-battery-line" },
  { value: "empty", label: "Vide",    icon: "ri-battery-line" },
];
const FUEL_FEES: Record<string, number> = { full: 0, "3/4": 150, "1/2": 300, "1/4": 500, empty: 800 };

const EXTERIOR_OPTIONS: { value: ReturnInspection["exteriorCondition"]; label: string }[] = [
  { value: "excellent", label: "Excellent — aucun dommage" },
  { value: "good",      label: "Bon — légères égratignures" },
  { value: "fair",      label: "Moyen — dommages visibles" },
  { value: "damaged",   label: "Endommagé — dommages importants" },
];
const INTERIOR_OPTIONS: { value: ReturnInspection["interiorCondition"]; label: string }[] = [
  { value: "excellent", label: "Excellent — très propre" },
  { value: "good",      label: "Bon — légèrement sale" },
  { value: "fair",      label: "Moyen — sale, nettoyage requis" },
  { value: "dirty",     label: "Sale — frais de nettoyage" },
];
const INTERIOR_FEES: Record<string, number> = { excellent: 0, good: 0, fair: 200, dirty: 500 };

export function ReturnInspectionModal({ booking, onConfirm, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [step, setStep] = useState<Step>("info");
  const [returnDate, setReturnDate] = useState(today);
  const [fuelLevel, setFuelLevel] = useState<ReturnInspection["fuelLevel"]>("full");
  const [extCondition, setExtCondition] = useState<ReturnInspection["exteriorCondition"]>("good");
  const [intCondition, setIntCondition] = useState<ReturnInspection["interiorCondition"]>("good");
  const [damages, setDamages] = useState<{ description: string; cost: number }[]>([]);
  const [newDamage, setNewDamage] = useState({ description: "", cost: 500 });
  const [notes, setNotes] = useState("");

  const expectedEnd = new Date(booking.endDate);
  const returned = new Date(returnDate);
  const isLate = returned > expectedEnd;
  const lateDays = isLate ? Math.ceil((returned.getTime() - expectedEnd.getTime()) / 86400000) : 0;
  const lateFees = lateDays * booking.pricePerDay * 1.5;
  const fuelFees = FUEL_FEES[fuelLevel] || 0;
  const interiorFees = INTERIOR_FEES[intCondition] || 0;
  const exteriorFee = extCondition === "damaged" ? 1500 : extCondition === "fair" ? 500 : 0;
  const damageFees = damages.reduce((sum, d) => sum + d.cost, 0);
  const totalExtraFees = Math.round(lateFees + fuelFees + interiorFees + exteriorFee + damageFees);
  const finalPrice = booking.totalPrice + totalExtraFees;

  const addDamage = () => {
    if (!newDamage.description.trim()) return;
    setDamages((p) => [...p, { ...newDamage }]);
    setNewDamage({ description: "", cost: 500 });
  };

  const handleConfirm = () => {
    const inspection: ReturnInspection = {
      returnDate,
      isLate,
      lateDays,
      lateFees: Math.round(lateFees),
      fuelLevel,
      fuelFees,
      exteriorCondition: extCondition,
      interiorCondition: intCondition,
      damages,
      damageFees,
      totalExtraFees,
      basePrice: booking.totalPrice,
      finalPrice,
      notes,
    };
    onConfirm(inspection);
  };

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <i className={`${icon} text-green-500`} />{title}
      </p>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-orange-500">
          <div>
            <h3 className="text-sm font-bold text-white">Processus de Retour</h3>
            <p className="text-xs text-orange-100">{booking.carName} — {booking.clientPrenom} {booking.clientNom}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-600 cursor-pointer">
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-3">
          {[
            { id: "info",       label: "Dates",      icon: "ri-calendar-line" },
            { id: "inspection", label: "Inspection", icon: "ri-search-eye-line" },
            { id: "damages",    label: "Dommages",   icon: "ri-alert-line" },
            { id: "summary",    label: "Bilan",      icon: "ri-file-chart-line" },
          ].map((s) => (
            <button key={s.id} onClick={() => setStep(s.id as Step)}
              className={`flex-1 flex flex-col items-center pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${step === s.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <i className={`${s.icon} mb-1 text-base`} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP: INFO */}
          {step === "info" && (
            <div>
              <Section title="Réservation" icon="ri-calendar-check-line">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                  {[
                    { l: "Client", v: `${booking.clientPrenom} ${booking.clientNom}` },
                    { l: "CIN", v: booking.clientCIN },
                    { l: "Véhicule", v: booking.carName },
                    { l: "Début", v: `${booking.startDate} à ${booking.startTime}` },
                    { l: "Fin prévue", v: `${booking.endDate} à ${booking.endTime}` },
                    { l: "Durée", v: `${booking.days} jour(s)` },
                    { l: "Villes", v: `${booking.villeDepart} → ${booking.villeRetour}` },
                    { l: "Montant base", v: `${booking.totalPrice.toLocaleString()} MAD` },
                  ].map((row) => (
                    <div key={row.l} className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">{row.l}</span>
                      <span className="font-semibold text-gray-800">{row.v}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Date de retour effective" icon="ri-calendar-line">
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 cursor-pointer" />
                {isLate && (
                  <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1">
                      <i className="ri-alarm-warning-line" /> Retard détecté !
                    </p>
                    <p className="text-xs text-red-600">{lateDays} jour(s) de retard</p>
                    <p className="text-xs text-red-600 font-semibold mt-0.5">
                      Frais de retard : {Math.round(lateFees).toLocaleString()} MAD (+50%/jour)
                    </p>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* STEP: INSPECTION */}
          {step === "inspection" && (
            <div>
              <Section title="Niveau de carburant" icon="ri-gas-station-line">
                <div className="grid grid-cols-5 gap-2">
                  {FUEL_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setFuelLevel(opt.value)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-medium cursor-pointer transition-all ${fuelLevel === opt.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                      <i className={`${opt.icon} text-base`} />
                      {opt.label}
                      {FUEL_FEES[opt.value] > 0 && <span className="text-red-500 text-xs">+{FUEL_FEES[opt.value]}</span>}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="État extérieur" icon="ri-car-line">
                <div className="space-y-2">
                  {EXTERIOR_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setExtCondition(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm cursor-pointer transition-all text-left ${extCondition === opt.value ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${extCondition === opt.value ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                        {extCondition === opt.value && <div className="w-full h-full rounded-full bg-white scale-50" />}
                      </div>
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      {opt.value === "fair" && <span className="ml-auto text-xs text-red-500">+500 MAD</span>}
                      {opt.value === "damaged" && <span className="ml-auto text-xs text-red-500">+1500 MAD</span>}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="État intérieur" icon="ri-steering-2-line">
                <div className="space-y-2">
                  {INTERIOR_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setIntCondition(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm cursor-pointer transition-all text-left ${intCondition === opt.value ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${intCondition === opt.value ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                        {intCondition === opt.value && <div className="w-full h-full rounded-full bg-white scale-50" />}
                      </div>
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      {INTERIOR_FEES[opt.value] > 0 && <span className="ml-auto text-xs text-red-500">+{INTERIOR_FEES[opt.value]} MAD</span>}
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* STEP: DAMAGES */}
          {step === "damages" && (
            <div>
              <Section title="Dommages supplémentaires" icon="ri-alert-line">
                <div className="flex gap-2 mb-3">
                  <input type="text" value={newDamage.description} onChange={(e) => setNewDamage((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Description du dommage..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                  <input type="number" value={newDamage.cost} onChange={(e) => setNewDamage((p) => ({ ...p, cost: Number(e.target.value) }))}
                    className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" min={0} />
                  <button onClick={addDamage} className="px-3 py-2 bg-orange-500 text-white rounded-xl text-sm cursor-pointer hover:bg-orange-600 whitespace-nowrap">
                    <i className="ri-add-line" />
                  </button>
                </div>
                {damages.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-xl">
                    <i className="ri-shield-check-line text-2xl mb-1 block" />
                    Aucun dommage supplémentaire signalé
                  </div>
                ) : (
                  <div className="space-y-2">
                    {damages.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <span className="text-sm text-red-700">{d.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-600">+{d.cost} MAD</span>
                          <button onClick={() => setDamages((p) => p.filter((_, j) => j !== i))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-200 cursor-pointer">
                            <i className="ri-close-line text-red-500 text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Notes et observations" icon="ri-sticky-note-line">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes supplémentaires pour l'archive..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange-400" />
              </Section>
            </div>
          )}

          {/* STEP: SUMMARY */}
          {step === "summary" && (
            <div>
              <div className="p-4 bg-gray-50 rounded-2xl mb-4 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Résumé de l'inspection</p>
                {[
                  { l: "Date retour", v: returnDate, warn: isLate },
                  { l: "Retard", v: isLate ? `${lateDays} jour(s)` : "Aucun" },
                  { l: "Carburant", v: fuelLevel },
                  { l: "État extérieur", v: extCondition },
                  { l: "État intérieur", v: intCondition },
                  { l: "Dommages", v: `${damages.length} signalé(s)` },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between text-xs py-1 border-b border-gray-100">
                    <span className="text-gray-500">{row.l}</span>
                    <span className={`font-semibold ${row.warn ? "text-red-600" : "text-gray-800"}`}>{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Fees breakdown */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200 mb-4">
                <p className="text-xs font-bold text-gray-600 mb-3">Décomposition des frais</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant de base ({booking.days}j × {booking.pricePerDay} MAD)</span>
                    <span className="font-semibold">{booking.totalPrice.toLocaleString()} MAD</span>
                  </div>
                  {lateFees > 0 && <div className="flex justify-between text-red-600"><span>Retard ({lateDays}j × {booking.pricePerDay}×1.5)</span><span className="font-semibold">+{Math.round(lateFees).toLocaleString()} MAD</span></div>}
                  {fuelFees > 0 && <div className="flex justify-between text-red-600"><span>Carburant manquant</span><span className="font-semibold">+{fuelFees} MAD</span></div>}
                  {exteriorFee > 0 && <div className="flex justify-between text-red-600"><span>Dommages extérieurs</span><span className="font-semibold">+{exteriorFee} MAD</span></div>}
                  {interiorFees > 0 && <div className="flex justify-between text-red-600"><span>Nettoyage intérieur</span><span className="font-semibold">+{interiorFees} MAD</span></div>}
                  {damageFees > 0 && <div className="flex justify-between text-red-600"><span>Dommages ({damages.length})</span><span className="font-semibold">+{damageFees.toLocaleString()} MAD</span></div>}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-800">Frais supplémentaires</span>
                    <span className={`font-bold ${totalExtraFees > 0 ? "text-red-600" : "text-green-600"}`}>
                      {totalExtraFees > 0 ? `+${totalExtraFees.toLocaleString()}` : "Aucun"} MAD
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-gray-800">TOTAL FINAL</span>
                    <span className="font-bold text-green-700">{finalPrice.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>

              {totalExtraFees > 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 mb-4">
                  <i className="ri-information-line mr-1" />
                  Des frais supplémentaires de <strong>{totalExtraFees.toLocaleString()} MAD</strong> ont été calculés. Le client devra régler la différence.
                </div>
              ) : (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-xs text-green-700 mb-4">
                  <i className="ri-checkbox-circle-line mr-1" />
                  Retour sans frais supplémentaires. La voiture sera remise en disponibilité.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          {step !== "info" && (
            <button onClick={() => setStep(step === "inspection" ? "info" : step === "damages" ? "inspection" : "damages")}
              className="flex items-center gap-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap hover:bg-gray-50">
              <i className="ri-arrow-left-line" /> Précédent
            </button>
          )}
          {step !== "summary" ? (
            <button onClick={() => setStep(step === "info" ? "inspection" : step === "inspection" ? "damages" : "summary")}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1">
              Suivant <i className="ri-arrow-right-line" />
            </button>
          ) : (
            <button onClick={handleConfirm}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 cursor-pointer whitespace-nowrap">
              Confirmer le retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
