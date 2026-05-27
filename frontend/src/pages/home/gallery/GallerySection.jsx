import { useMemo } from "react";
import MarqueeImport from "react-fast-marquee";

const Marquee = MarqueeImport?.default ?? MarqueeImport;

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
];

export default function GallerySection({ resources = [] }) {
  const galleryItems = useMemo(() => {
    const items = [];
    resources.forEach((resource) => {
      const images = resource.images?.length ? resource.images : DEFAULT_IMAGES;
      images.forEach((image) => {
        items.push({
          image,
          name: resource.name || "Demo Ground",
        });
      });
    });
    if (!items.length) {
      return DEFAULT_IMAGES.map((image, index) => ({
        image,
        name: `Demo Ground ${index + 1}`,
      }));
    }
    return items.slice(0, 8);
  }, [resources]);

  return (
    <section id="gallery" className="relative left-1/2 right-1/2 w-screen ml-[-50vw] mr-[-50vw] bg-gradient-to-b from-slate-50 to-white py-10">
      <div className="mx-auto mb-6 w-full max-w-[1180px] px-4 md:px-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-violet-600">Gallery</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Top Ground Photos</h2>
        <p className="mt-2 text-slate-600">Explore venues from our partner companies across the city.</p>
      </div>

      <div className="w-full overflow-hidden">
        <Marquee
          autoFill
          pauseOnHover
          pauseOnClick
          speed={32}
          gradient
          gradientColor="#f8fafc"
          gradientWidth={60}
          className="w-full py-1"
        >
          {galleryItems.map((item, index) => (
            <div
              key={`${item.image}-${index}`}
              className="group mr-4 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:w-[320px]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={`${item.name} ground ${index + 1}`}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="border-t border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
