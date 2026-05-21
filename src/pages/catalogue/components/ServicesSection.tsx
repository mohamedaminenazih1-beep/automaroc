import { mockServices } from "@/mocks/reviews";

export function ServicesSection() {
  return (
    <section className="py-16 px-4 md:px-6" style={{ backgroundColor: "#f7fdf7" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">NOS SERVICES</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Pourquoi choisir <span className="text-green-600">AutoMaroc</span> ?
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Nous mettons tout en œuvre pour que votre expérience de location soit simple, sûre et agréable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-all duration-200 group">
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${s.color} mb-4`}>
                <i className={`${s.icon} text-xl`} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
