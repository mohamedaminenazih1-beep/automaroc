import { useState } from "react";
import { mockFaqs } from "@/mocks/reviews";

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 px-4 md:px-6" style={{ backgroundColor: "#f7fdf7" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">FAQ</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Questions fréquentes</h2>
          <p className="text-gray-500 text-sm">Tout ce que vous devez savoir avant de réserver.</p>
        </div>

        <div className="space-y-3">
          {mockFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</span>
                <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full transition-all ${openIdx === idx ? "bg-green-500" : "bg-gray-100"}`}>
                  <i className={`${openIdx === idx ? "ri-subtract-line text-white" : "ri-add-line text-gray-500"} text-sm`} />
                </div>
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
