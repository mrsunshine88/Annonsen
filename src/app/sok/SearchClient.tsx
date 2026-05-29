"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";
import Image from "next/image";

export default function SearchClient({ categories, autoLocation, defaultLocation }: { categories: any[], autoLocation: boolean, defaultLocation?: string | null }) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // States for filters
  const [q, setQ] = useState(searchParams.get("q") || "");
  
  const initialCat = categories.flatMap(c => [c, ...(c.subcategories || [])]).find(c => c.id === (searchParams.get("category") || ""));
  const initialMainId = initialCat?.parentId ? initialCat.parentId : (initialCat?.id || "");
  const initialSubId = initialCat?.parentId ? initialCat.id : "";
  const initialSubSubId = ""; // Förenklad initialisering för URL-parsing (vi hämtar det mesta från categoryID)

  const [mainCategoryId, setMainCategoryId] = useState(initialMainId);
  const [subCategoryId, setSubCategoryId] = useState(initialSubId);
  const [subSubCategoryId, setSubSubCategoryId] = useState(initialSubSubId);
  
  const activeCategoryId = subSubCategoryId || subCategoryId || mainCategoryId;

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [advertiserType, setAdvertiserType] = useState(searchParams.get("advertiserType") || "Alla");
  const [locations, setLocations] = useState<string[]>(searchParams.getAll("location"));
  const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.getAll("city"));
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Car states
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [minMileage, setMinMileage] = useState(searchParams.get("minMileage") || "");
  const [maxMileage, setMaxMileage] = useState(searchParams.get("maxMileage") || "");
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "");
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "");
  const [minHp, setMinHp] = useState(searchParams.get("minHp") || "");
  const [maxHp, setMaxHp] = useState(searchParams.get("maxHp") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [gearbox, setGearbox] = useState(searchParams.get("gearbox") || "");
  const [fuel, setFuel] = useState(searchParams.get("fuel") || "");
  const [drivetrain, setDrivetrain] = useState(searchParams.get("drivetrain") || "");

  const selectedCategory = categories.flatMap(c => [c, ...(c.subcategories || [])]).find(c => c.id === activeCategoryId);
  const isCar = selectedCategory?.name === "Bilar" || selectedCategory?.name === "Bil" || selectedCategory?.name === "Fordon";

  const [baseLocation, setBaseLocation] = useState<string | null>(defaultLocation || null);

  // Location Effect (Default Location or IP Geolocation)
  useEffect(() => {
    if (locations.length === 0 && !searchParams.has("location")) {
      if (defaultLocation) {
        setLocations([defaultLocation]);
      } else if (autoLocation) {
        fetch("https://ipinfo.io/json")
          .then(res => res.json())
          .then(data => {
            if (data.region) {
              const swedishCounties = ["Blekinge", "Dalarna", "Gotland", "Gävleborg", "Halland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Skåne", "Stockholm", "Södermanland", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland", "Örebro", "Östergötland"];
              const matchedCounty = swedishCounties.find(county => data.region.includes(county) || data.region === county);
              if (matchedCounty) {
                setLocations([matchedCounty]);
                setBaseLocation(matchedCounty);
              }
            }
          })
          .catch(() => {
            // Ignorera fel tyst
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLocation, autoLocation]);

  // Fetch available cities based on selected locations
  useEffect(() => {
    const query = locations.length > 0 ? `?` + locations.map(l => `location=${encodeURIComponent(l)}`).join("&") : "";
    fetch(`/api/locations/cities${query}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableCities(data);
      })
      .catch(console.error);
  }, [locations]);

  const fetchAds = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }
    
    const currentPage = isLoadMore ? page + 1 : 1;
    
    // Bygg URL
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    
    if (activeCategoryId) {
      // Hitta alla id:n som tillhör denna kategori (även underkategorier)
      const catIds = new Set<string>([activeCategoryId]);
      
      const mainCat = categories.find(c => c.id === activeCategoryId);
      if (mainCat && mainCat.subcategories) {
        mainCat.subcategories.forEach((sub: any) => {
          catIds.add(sub.id);
          if (sub.subcategories) sub.subcategories.forEach((ss: any) => catIds.add(ss.id));
        });
      } else {
        // Om det är en underkategori vi har klickat på
        for (const m of categories) {
          if (m.subcategories) {
            const sub = m.subcategories.find((s: any) => s.id === activeCategoryId);
            if (sub && sub.subcategories) {
              sub.subcategories.forEach((ss: any) => catIds.add(ss.id));
            }
          }
        }
      }
      
      catIds.forEach(id => params.append("category", id));
    }
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (brand) params.set("brand", brand);
    if (advertiserType && advertiserType !== "Alla") params.set("advertiserType", advertiserType);
    locations.forEach(loc => params.append("location", loc));
    selectedCities.forEach(city => params.append("city", city));
    
    if (isCar) {
      params.set("isCar", "true");
      if (model) params.set("model", model);
      if (minMileage) params.set("minMileage", minMileage);
      if (maxMileage) params.set("maxMileage", maxMileage);
      if (minYear) params.set("minYear", minYear);
      if (maxYear) params.set("maxYear", maxYear);
      if (minHp) params.set("minHp", minHp);
      if (maxHp) params.set("maxHp", maxHp);
      if (color) params.set("color", color);
      if (gearbox) params.set("gearbox", gearbox);
      if (fuel) params.set("fuel", fuel);
      if (drivetrain) params.set("drivetrain", drivetrain);
    }

    params.set("page", currentPage.toString());

    // Uppdatera URL utan att ladda om sidan (men inkludera inte page för att hålla URLen ren om man inte vill)
    const urlParams = new URLSearchParams(params.toString());
    urlParams.delete("page");
    router.replace(`/sok?${urlParams.toString()}`, { scroll: false });

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      
      if (isLoadMore) {
        setAds(prev => [...prev, ...data.ads]);
        setPage(currentPage);
      } else {
        setAds(data.ads || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserType, mainCategoryId, subCategoryId, subSubCategoryId, selectedCities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAds();
  };

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap" }}>
      
      {/* Sidebar Filters */}
      <aside className="search-sidebar" style={{ width: "300px", flexShrink: 0 }}>
        <form onSubmit={handleSearch} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Filtrera</h3>
          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Sökord</label>
            <input type="text" className="input-field" value={q} onChange={e => setQ(e.target.value)} placeholder="T.ex Volvo S70" />
          </div>

          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Märke</label>
            <input type="text" className="input-field" value={brand} onChange={e => setBrand(e.target.value)} placeholder="T.ex. Apple, Volvo" />
          </div>

          {!showAdvancedFilters ? (
            <button 
              type="button" 
              onClick={() => setShowAdvancedFilters(true)} 
              className="btn-secondary" 
              style={{ padding: "0.5rem", fontSize: "0.9rem", marginTop: "0.5rem" }}
            >
              + Visa fler filter (Kategori, Pris, Ort etc.)
            </button>
          ) : (
            <>
              <div>
                <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Säljare</label>
                <select className="input-field" value={advertiserType} onChange={e => setAdvertiserType(e.target.value)}>
                  <option value="Alla">Alla</option>
                  <option value="Privat">Endast Privat</option>
                  <option value="Företag">Endast Företag</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Huvudkategori</label>
                <select 
                  className="input-field" 
                  value={mainCategoryId} 
                  onChange={e => { 
                    setMainCategoryId(e.target.value); 
                    setSubCategoryId("");
                    setSubSubCategoryId("");
                  }}
                >
                  <option value="">Alla kategorier</option>
                  {categories.map(mainCat => (
                    <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
                  ))}
                </select>
              </div>

              {mainCategoryId && categories.find(c => c.id === mainCategoryId)?.subcategories?.length > 0 && (
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Underkategori</label>
                  <select 
                    className="input-field" 
                    value={subCategoryId} 
                    onChange={e => { 
                      setSubCategoryId(e.target.value); 
                      setSubSubCategoryId("");
                    }}
                  >
                    <option value="">Alla inom {categories.find(c => c.id === mainCategoryId)?.name}</option>
                    {categories.find(c => c.id === mainCategoryId)?.subcategories.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {subCategoryId && categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.subcategories?.length > 0 && (
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Specifik Kategori</label>
                  <select 
                    className="input-field" 
                    value={subSubCategoryId} 
                    onChange={e => { 
                      setSubSubCategoryId(e.target.value); 
                    }}
                  >
                    <option value="">Alla inom {categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.name}</option>
                    {categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.subcategories.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Min Pris</label>
                  <input type="number" className="input-field" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Max Pris</label>
                  <input type="number" className="input-field" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.9rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Län / Plats</label>
                <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem", border: "1px solid rgba(226, 232, 240, 0.5)", borderRadius: "var(--radius-lg)", backgroundColor: "color-mix(in srgb, var(--color-bg-subtle) 50%, transparent)" }}>
                  {["Blekinge", "Dalarna", "Gotland", "Gävleborg", "Halland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Skåne", "Stockholm", "Södermanland", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland", "Örebro", "Östergötland"].map(loc => (
                    <label 
                      key={loc} 
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        padding: "0.4rem 0.8rem", 
                        fontSize: "0.85rem", 
                        fontWeight: 600,
                        cursor: "pointer",
                        backgroundColor: locations.includes(loc) ? "var(--color-primary)" : "var(--color-bg-surface)",
                        color: locations.includes(loc) ? "#ffffff" : "var(--color-text-secondary)",
                        border: `1px solid ${locations.includes(loc) ? "var(--color-primary)" : "rgba(226, 232, 240, 0.8)"}`,
                        borderRadius: "100px",
                        transition: "all var(--transition-fast)",
                        boxShadow: locations.includes(loc) ? "0 4px 10px rgba(59, 130, 246, 0.3)" : "0 2px 4px rgba(0,0,0,0.02)"
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={locations.includes(loc)}
                        onChange={(e) => {
                          if (e.target.checked) setLocations([...locations, loc]);
                          else setLocations(locations.filter(l => l !== loc));
                        }}
                        style={{ display: "none" }}
                      />
                      {loc}
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button 
                    type="button" 
                    onClick={() => setLocations([])} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", borderRadius: "100px", backgroundColor: "var(--color-bg-surface)" }}
                  >
                    Rensa val
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      const centerLocation = baseLocation || (locations.length > 0 ? locations[0] : null);
                      
                      if (!centerLocation) {
                        showNotification("Kunde inte avgöra din hemort. Välj ett län manuellt eller ställ in din plats i Inställningar.", "error");
                        return;
                      }

                      const adjacentMap: Record<string, string[]> = {
                        "Blekinge": ["Skåne", "Kronoberg", "Kalmar"],
                        "Dalarna": ["Jämtland", "Gävleborg", "Västmanland", "Örebro", "Värmland"],
                        "Gotland": [],
                        "Gävleborg": ["Västernorrland", "Jämtland", "Dalarna", "Västmanland", "Uppsala"],
                        "Halland": ["Skåne", "Kronoberg", "Jönköping", "Västra Götaland"],
                        "Jämtland": ["Västerbotten", "Västernorrland", "Gävleborg", "Dalarna"],
                        "Jönköping": ["Halland", "Kronoberg", "Kalmar", "Östergötland", "Västra Götaland"],
                        "Kalmar": ["Blekinge", "Kronoberg", "Jönköping", "Östergötland"],
                        "Kronoberg": ["Skåne", "Blekinge", "Kalmar", "Jönköping", "Halland"],
                        "Norrbotten": ["Västerbotten"],
                        "Skåne": ["Halland", "Kronoberg", "Blekinge"],
                        "Stockholm": ["Uppsala", "Södermanland"],
                        "Södermanland": ["Stockholm", "Västmanland", "Örebro", "Östergötland"],
                        "Uppsala": ["Stockholm", "Västmanland", "Gävleborg"],
                        "Värmland": ["Dalarna", "Örebro", "Västra Götaland"],
                        "Västerbotten": ["Norrbotten", "Jämtland", "Västernorrland"],
                        "Västernorrland": ["Västerbotten", "Jämtland", "Gävleborg"],
                        "Västmanland": ["Dalarna", "Gävleborg", "Uppsala", "Södermanland", "Örebro"],
                        "Västra Götaland": ["Halland", "Jönköping", "Östergötland", "Örebro", "Värmland"],
                        "Örebro": ["Dalarna", "Västmanland", "Södermanland", "Östergötland", "Västra Götaland", "Värmland"],
                        "Östergötland": ["Kalmar", "Jönköping", "Västra Götaland", "Örebro", "Södermanland"]
                      };
                      
                      const adj = adjacentMap[centerLocation] || [];
                      const allAdjChecked = adj.length > 0 && adj.every(a => locations.includes(a));

                      if (allAdjChecked) {
                        setLocations(locations.filter(l => !adj.includes(l)));
                      } else {
                        const newLocs = new Set(locations);
                        newLocs.add(centerLocation);
                        adj.forEach(a => newLocs.add(a));
                        setLocations(Array.from(newLocs));
                      }
                    }} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", borderRadius: "100px", backgroundColor: "var(--color-bg-surface)" }}
                  >
                    + Angränsande
                  </button>
                </div>
                
                {availableCities.length > 0 && (
                  <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid rgba(226, 232, 240, 0.5)", borderRadius: "var(--radius-lg)", backgroundColor: "color-mix(in srgb, var(--color-bg-subtle) 50%, transparent)" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>Filtrera på ort</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                      {availableCities.map(city => (
                        <label 
                          key={city} 
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            padding: "0.3rem 0.7rem", 
                            fontSize: "0.8rem", 
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor: selectedCities.includes(city) ? "var(--color-primary)" : "var(--color-bg-surface)",
                            color: selectedCities.includes(city) ? "#ffffff" : "var(--color-text-secondary)",
                            border: `1px solid ${selectedCities.includes(city) ? "var(--color-primary)" : "rgba(226, 232, 240, 0.8)"}`,
                            borderRadius: "100px",
                            transition: "all var(--transition-fast)",
                            boxShadow: selectedCities.includes(city) ? "0 4px 10px rgba(59, 130, 246, 0.3)" : "0 2px 4px rgba(0,0,0,0.02)"
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedCities.includes(city)}
                            onChange={(e) => {
                              let newCities;
                              if (e.target.checked) {
                                newCities = [...selectedCities, city];
                              } else {
                                newCities = selectedCities.filter(c => c !== city);
                              }
                              setSelectedCities(newCities);
                            }}
                            style={{ display: "none" }}
                          />
                          {city}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isCar && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                  <h4 style={{ color: "var(--color-primary)", margin: 0 }}>Bilar</h4>

                  <div>
                    <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Modell</label>
                    <input type="text" className="input-field" value={model} onChange={e => setModel(e.target.value)} placeholder="T.ex. S70" />
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Min Miltal</label>
                      <input type="number" className="input-field" value={minMileage} onChange={e => setMinMileage(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Max Miltal</label>
                      <input type="number" className="input-field" value={maxMileage} onChange={e => setMaxMileage(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Min År</label>
                      <input type="number" className="input-field" value={minYear} onChange={e => setMinYear(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Max År</label>
                      <input type="number" className="input-field" value={maxYear} onChange={e => setMaxYear(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Växellåda</label>
                    <select className="input-field" value={gearbox} onChange={e => setGearbox(e.target.value)}>
                      <option value="">Alla</option>
                      <option value="Automat">Automat</option>
                      <option value="Manuell">Manuell</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Drivmedel</label>
                    <select className="input-field" value={fuel} onChange={e => setFuel(e.target.value)}>
                      <option value="">Alla</option>
                      <option value="Bensin">Bensin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="El">El</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              )}

              <button 
                type="button" 
                onClick={() => setShowAdvancedFilters(false)} 
                className="btn-secondary" 
                style={{ padding: "0.5rem", fontSize: "0.9rem", marginTop: "0.5rem" }}
              >
                - Dölj filter
              </button>
            </>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: "1rem", borderRadius: "100px", width: "100%" }}>Använd Filter</button>
        </form>
      </aside>

      {/* Results Area */}
      <main style={{ flex: 1, minWidth: "300px" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Sökresultat ({totalCount})</h2>
        
        {loading ? (
          <p>Söker...</p>
        ) : ads.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)" }}>Inga annonser matchade din sökning.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ads.map(ad => (
              <div 
                key={ad.id} 
                className="glass-panel search-result-card" 
                onClick={() => router.push(`/annons/${ad.id}`)}
                style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", cursor: "pointer" }}
              >
                {/* Bild */}
                <div className="search-result-image" style={{ width: "120px", height: "120px", position: "relative", flexShrink: 0, backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {ad.imageUrls && ad.imageUrls.length > 0 ? (
                    <Image src={ad.imageUrls[0]} alt={ad.title} fill sizes="(max-width: 768px) 120px, 120px" style={{ objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>Ingen bild</span>
                  )}
                </div>

                {/* Info & Pris */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, color: "var(--color-primary)", lineHeight: 1.2 }}>{ad.title}</h3>
                    {ad.advertiserType === "Företag" && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, backgroundColor: "var(--color-primary)", color: "white", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>Företag</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", color: "var(--color-text-secondary)", fontSize: "0.9rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <span>{ad.location || "Okänd plats"}</span>
                    <span>{new Date(ad.createdAt).toLocaleDateString("sv-SE")}</span>
                    {ad.brand && <span>{ad.brand} {ad.model || ""}</span>}
                    {ad.year && <span>{ad.year}</span>}
                    {ad.mileage && <span>{ad.mileage} mil</span>}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", gap: "0.5rem" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, whiteSpace: "nowrap" }}>{ad.price} kr</div>
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/annons/${ad.id}`); }} className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.9rem", whiteSpace: "nowrap" }}>Läs mer</button>
                  </div>
                </div>
              </div>
            ))}
            
            {ads.length < totalCount && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                <button 
                  onClick={() => fetchAds(true)}
                  disabled={loadingMore}
                  className="btn-primary"
                  style={{ padding: "0.75rem 2rem", borderRadius: "100px" }}
                >
                  {loadingMore ? "Laddar fler..." : "Ladda fler annonser"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
