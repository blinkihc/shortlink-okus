import { useLinkStore } from '../../stores/useLinkStore';
import { FilterToolbar } from './FilterToolbar';
import { LinkItemCard } from './LinkItemCard';

interface LinksViewProps {
  onOpenQR: (url: string) => void;
}

export function LinksView({ onOpenQR }: LinksViewProps) {
  const { links, searchQuery, selectedCategory } = useLinkStore();

  const filteredLinks = links.filter(link => {
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || link.shortSlug.toLowerCase().includes(q) || link.originalUrl.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Sort pinned first
  filteredLinks.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-snip-ink tracking-tight">Daftar Tautan & QR</h2>
        <p className="text-xs text-slate-600 mt-0.5">Kelola riwayat tautan secara lokal di perangkatmu dan pantau performanya.</p>
      </div>

      <FilterToolbar />

      <div className="flex flex-col gap-2.5">
        {filteredLinks.length === 0 ? (
          <div className="card-neo text-center py-8 text-slate-500">
            <div className="text-sm font-extrabold text-snip-ink mb-1">Tautan Tidak Ditemukan</div>
            <p className="text-xs">Coba ubah kata kunci pencarian atau ganti filter kategori.</p>
          </div>
        ) : (
          filteredLinks.map(link => (
            <LinkItemCard 
              key={link.id} 
              link={link} 
              onOpenQR={onOpenQR} 
            />
          ))
        )}
      </div>
    </div>
  );
}
