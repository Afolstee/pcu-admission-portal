export default function PartTimeHero() {
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden">
      {/* Background image */}
      <img
        src="/images/students.jpg"
        alt="Part Time Programmes"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark + purple overlay */}
      <div className="absolute inset-0 bg-purple-900/60" />

      {/* Title */}
      <div className="relative z-10 flex items-end h-full px-10 pb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">
          Part Time Programmes
        </h1>
      </div>
    </div>
  );
}
