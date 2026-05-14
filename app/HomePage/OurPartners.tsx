const partners = [
  { name: "Rome Business School", img: "/images/Rome-Business-School.png" },
  { name: "JUPEB Board", img: "/images/JUPEBLogoSmall.png" },
  { name: "Nigerian Bioinformatics & Genomics Network", img: "/images/nbgn_logo.png" },
  { name: "CEPRO Center For Peace Promotion", img: "/images/CEPRO.png" },
  { name: "Cocoa Research Institute of Nigeria", img: "/images/CRIN-logo-150x150.jpg" },
];

export default function OurPartners() {
  return (
    <div className="px-10 py-12">
      <h2 className="text-xl font-bold text-gray-800 mb-8 text-center">Our Partners</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {partners.map((p, i) => (
          <div
            key={i}
            className="w-full md:w-40 h-25 flex items-center justify-center p-3 overflow-hidden border-b border-gray-100 md:border-0"
          >
            <img
              src={p.img}
              alt={p.name}
              className="max-w-[200px] md:max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fallback to text if image not found
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <span className="hidden text-sm md:text-[10px] font-bold text-center leading-tight text-gray-600">
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}