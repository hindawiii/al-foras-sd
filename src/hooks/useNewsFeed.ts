import { useEffect, useState } from "react";

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  category: "global" | "arab" | "local" | "economy" | "sports" | "weather";
  image?: string;
  publishedAt?: string;
  time: string;
}

interface FeedSource {
  name: string;
  url: string; // RSS feed URL
  category: FeedItem["category"];
}

// Public RSS feeds (Arabic + global). We proxy them through rss2json (free, public).
const SOURCES: FeedSource[] = [
  { name: "الجزيرة",     url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84051c5e498/73d0e1b4-532f-45ef-b135-bfdff8b8cab9", category: "arab" },
  { name: "BBC عربي",    url: "https://feeds.bbci.co.uk/arabic/rss.xml", category: "arab" },
  { name: "Sky News عربية", url: "https://www.skynewsarabia.com/web/rss/4608.xml", category: "arab" },
  { name: "BBC World",   url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "global" },
  { name: "CNN",         url: "http://rss.cnn.com/rss/edition_world.rss", category: "global" },
  { name: "Reuters",     url: "https://feeds.reuters.com/reuters/worldNews", category: "global" },
];

const PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

const stripHtml = (s: string) => s?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() ?? "";

const timeAgo = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  return `قبل ${Math.floor(diff / 86400)} يوم`;
};

export const useNewsFeed = (intervalMs = 5 * 60_000) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          SOURCES.map(s =>
            fetch(`${PROXY}${encodeURIComponent(s.url)}`)
              .then(r => r.json())
              .then(d => ({ source: s, data: d }))
          )
        );
        if (cancelled) return;
        const aggregated: FeedItem[] = [];
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          const { source, data } = r.value;
          const arr = data?.items ?? [];
          for (const it of arr.slice(0, 8)) {
            const desc = stripHtml(it.description ?? "");
            // try to find an image
            const img =
              it.thumbnail ||
              it.enclosure?.link ||
              (it.description?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? undefined);
            aggregated.push({
              id: `${source.name}-${it.guid ?? it.link ?? it.title}`,
              title: stripHtml(it.title ?? ""),
              summary: desc.slice(0, 240),
              link: it.link ?? source.url,
              source: source.name,
              category: source.category,
              image: img,
              publishedAt: it.pubDate,
              time: timeAgo(it.pubDate),
            });
          }
        }
        // Sort newest first
        aggregated.sort((a, b) => {
          const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return tb - ta;
        });
        setItems(aggregated);
        setUpdatedAt(new Date());
        setError(aggregated.length === 0 ? "لا توجد أخبار متاحة الآن" : null);
      } catch {
        if (!cancelled) setError("تعذر تحميل الأخبار");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = window.setInterval(load, intervalMs);
    return () => { cancelled = true; window.clearInterval(t); };
  }, [intervalMs]);

  return { items, loading, error, updatedAt };
};
