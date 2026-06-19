import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets, RefreshCw } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ENV } from "@/lib/env";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  temp: number;
  code: number;
  windspeed: number;
  humidity?: number;
  city: string;
  country?: string;
}

const WMO: Record<number, { ar: string; en: string; bg: string; Icon: typeof Sun }> = {
  0:  { ar: "صافٍ",          en: "Clear",            bg: "from-amber-500/30 via-orange-400/15 to-background", Icon: Sun },
  1:  { ar: "غائم جزئياً",   en: "Partly cloudy",    bg: "from-amber-400/25 via-slate-500/15 to-background", Icon: Sun },
  2:  { ar: "غائم جزئياً",   en: "Partly cloudy",    bg: "from-slate-400/25 via-slate-600/15 to-background", Icon: Cloud },
  3:  { ar: "غائم",          en: "Cloudy",           bg: "from-slate-500/30 via-slate-700/20 to-background", Icon: Cloud },
  45: { ar: "ضباب",          en: "Fog",              bg: "from-slate-400/30 via-slate-600/20 to-background", Icon: Cloud },
  48: { ar: "ضباب كثيف",     en: "Dense fog",        bg: "from-slate-400/30 via-slate-600/20 to-background", Icon: Cloud },
  51: { ar: "رذاذ خفيف",     en: "Light drizzle",    bg: "from-sky-500/30 via-slate-600/20 to-background", Icon: CloudDrizzle },
  53: { ar: "رذاذ",          en: "Drizzle",          bg: "from-sky-500/30 via-slate-600/20 to-background", Icon: CloudDrizzle },
  55: { ar: "رذاذ كثيف",     en: "Heavy drizzle",    bg: "from-sky-600/35 via-slate-700/20 to-background", Icon: CloudDrizzle },
  61: { ar: "أمطار خفيفة",   en: "Light rain",       bg: "from-sky-600/35 via-slate-700/25 to-background", Icon: CloudRain },
  63: { ar: "أمطار",         en: "Rain",             bg: "from-sky-700/40 via-slate-800/25 to-background", Icon: CloudRain },
  65: { ar: "أمطار غزيرة",   en: "Heavy rain",       bg: "from-sky-800/45 via-slate-900/30 to-background", Icon: CloudRain },
  71: { ar: "ثلوج خفيفة",    en: "Light snow",       bg: "from-sky-200/30 via-slate-500/20 to-background", Icon: CloudSnow },
  73: { ar: "ثلوج",          en: "Snow",             bg: "from-sky-200/35 via-slate-500/25 to-background", Icon: CloudSnow },
  75: { ar: "ثلوج كثيفة",    en: "Heavy snow",       bg: "from-sky-200/40 via-slate-500/30 to-background", Icon: CloudSnow },
  80: { ar: "زخات مطر",      en: "Rain showers",     bg: "from-sky-700/40 via-slate-800/25 to-background", Icon: CloudRain },
  81: { ar: "زخات مطر",      en: "Rain showers",     bg: "from-sky-700/40 via-slate-800/25 to-background", Icon: CloudRain },
  82: { ar: "زخات عنيفة",    en: "Heavy showers",    bg: "from-sky-800/45 via-slate-900/30 to-background", Icon: CloudRain },
  95: { ar: "عاصفة رعدية",   en: "Thunderstorm",     bg: "from-purple-700/40 via-slate-900/30 to-background", Icon: CloudLightning },
  96: { ar: "عاصفة برَدية",  en: "Hail storm",       bg: "from-purple-700/40 via-slate-900/30 to-background", Icon: CloudLightning },
  99: { ar: "عاصفة برَدية",  en: "Severe hail",      bg: "from-purple-800/50 via-slate-900/35 to-background", Icon: CloudLightning },
};

const desc = (code: number) => WMO[code] ?? { ar: "—", en: "—", bg: "from-slate-500/20 to-background", Icon: Cloud };

// Map OpenWeather "main" / id → WMO-like code so existing UI still works.
const owToWmo = (id: number): number => {
  if (id >= 200 && id < 300) return 95;        // thunderstorm
  if (id >= 300 && id < 400) return 51;        // drizzle
  if (id >= 500 && id < 504) return 61;
  if (id === 511) return 65;
  if (id >= 520 && id < 600) return 80;
  if (id >= 600 && id < 700) return 71;
  if (id >= 700 && id < 800) return 45;        // atmosphere/fog
  if (id === 800) return 0;
  if (id === 801) return 1;
  if (id === 802) return 2;
  if (id === 803 || id === 804) return 3;
  return 3;
};

async function loadFromOpenMeteo(target: string): Promise<WeatherData | null> {
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(target)}&count=1&language=ar&format=json`
  ).then(r => r.json());
  const place = geo?.results?.[0];
  if (!place) return null;
  const w = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`
  ).then(r => r.json());
  const c = w?.current;
  if (!c) return null;
  return {
    temp: Math.round(c.temperature_2m),
    code: c.weather_code,
    windspeed: Math.round(c.wind_speed_10m),
    humidity: c.relative_humidity_2m,
    city: place.name,
    country: place.country,
  };
}

async function loadFromOpenWeather(target: string, key: string): Promise<WeatherData | null> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(target)}&appid=${key}&units=metric&lang=ar`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.cod !== 200) return null;
  return {
    temp: Math.round(data.main?.temp ?? 0),
    code: owToWmo(data.weather?.[0]?.id ?? 800),
    windspeed: Math.round((data.wind?.speed ?? 0) * 3.6),
    humidity: data.main?.humidity,
    city: data.name ?? target,
    country: data.sys?.country,
  };
}

export const WeatherWidget = () => {
  const { city, setCity } = useSettings();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { info: geo } = useGeolocation(true);
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";

  const load = async (target: string) => {
    if (!target.trim()) return;
    try {
      setLoading(true); setError(null);
      const result = ENV.OPENWEATHER_API_KEY
        ? await loadFromOpenWeather(target, ENV.OPENWEATHER_API_KEY).catch(() => null)
        : null;
      const finalResult = result ?? await loadFromOpenMeteo(target);
      if (!finalResult) { setError(t("cityNotFound")); setLoading(false); return; }
      setData(finalResult);
      setCity(finalResult.city);
    } catch {
      setError(t("weatherFailed"));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(city); /* eslint-disable-next-line */ }, []);

  // When GPS resolves, refresh weather to user's actual location
  useEffect(() => {
    if (geo?.city && geo.city !== city) load(geo.city);
    // eslint-disable-next-line
  }, [geo?.city]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { load(query.trim()); setQuery(""); }
  };

  const meta = data ? desc(data.code) : desc(0);
  const Icon = meta.Icon;
  const isRainy = data && [51,53,55,61,63,65,80,81,82,95,96,99].includes(data.code);
  const isClear = data && data.code === 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-primary/30 shadow-luxe bg-gradient-to-br ${meta.bg}`} dir={dir}>
      {/* Live background effects */}
      {isClear && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-400/40 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}
      {isRainy && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute top-0 w-px h-6 bg-sky-200/50"
              style={{ left: `${(i * 7) % 100}%` }}
              animate={{ y: ["-10%", "120%"] }}
              transition={{ duration: 0.8 + (i % 5) * 0.15, repeat: Infinity, delay: (i % 7) * 0.1, ease: "linear" }}
            />
          ))}
        </div>
      )}
      {data && [1,2,3,45,48].includes(data.code) && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-2 left-4 w-24 h-10 rounded-full bg-slate-300/25 blur-2xl"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative p-4">
        <form onSubmit={onSubmit} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("searchCityPlaceholder")}
              className={`h-10 ${isRtl ? "pr-9 text-right" : "pl-9 text-left"} bg-background/40 border-primary/20`}
            />
          </div>
          <button type="submit"
            className="h-10 px-3 rounded-md bg-gold-gradient text-primary-foreground text-xs font-bold shadow-gold whitespace-nowrap">
            {t("search")}
          </button>
        </form>

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        {data && (
          <div className="flex items-center justify-between gap-3">
            <div className={`${isRtl ? "text-right" : "text-left"} flex-1 min-w-0`}>
              <div className={`flex items-center gap-1.5 ${isRtl ? "justify-end" : "justify-start"} text-xs text-muted-foreground mb-1`}>
                <span className="truncate">{data.city}{data.country ? `، ${data.country}` : ""}</span>
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              </div>
              <p className="font-display text-4xl text-foreground leading-none" dir="ltr">
                {data.temp}°<span className="text-base text-muted-foreground">C</span>
              </p>
              <p className="text-xs text-primary mt-1">{lang === "ar" ? meta.ar : meta.en}</p>
              <div className={`flex items-center gap-3 ${isRtl ? "justify-end" : "justify-start"} mt-2 text-[10px] text-muted-foreground`}>
                {data.humidity != null && (
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{data.humidity}%</span>
                )}
                <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{data.windspeed} km/h</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-background/30 border border-primary/20 flex items-center justify-center flex-shrink-0">
              {loading
                ? <RefreshCw className="w-7 h-7 text-primary animate-spin" />
                : <Icon className="w-9 h-9 text-primary" strokeWidth={1.5} />}
            </div>
          </div>
        )}

        {!data && !error && (
          <div className="flex items-center justify-center py-3 text-muted-foreground text-xs">
            <RefreshCw className={`w-3.5 h-3.5 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} /> {t("loadingWeather")}
          </div>
        )}
      </div>
    </div>
  );
};