export const AdmissionHero = () => {
  return (
    <section
      className="relative w-full min-h-[340px] flex items-center bg-gray-900 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/photo-1498568584133-7b76cea38337.jpeg')" }}
    >
      {/* Dark overlay */}
     <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }} />

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-between" style={{ padding: "4rem clamp(1.5rem, 8vw, 14rem)" }}>

        {/* Left — label + headline */}
        <div className="max-w-lg">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-white mb-4">
            Register Now
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight text-white">
            Admission into PCU <br />
            for 2025/2026 Session <br />
            is On!
          </h1>
        </div>

        {/* Right — CTA button */}
        <div className="shrink-0">
        <button
  type="button"
  className="bg-white text-black text-xs font-bold tracking-[0.2em] uppercase px-10 py-5 hover:bg-green-500 hover:text-white transition-colors duration-300 cursor-pointer"
>
            Enroll Now
          </button>
        </div>

      </div>
    </section>
  );
};