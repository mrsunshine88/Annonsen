"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

export default function CreateAdForm({ categories, autoLocation = true, defaultLocation, initialData, settings, user }: { categories: any[], autoLocation?: boolean, defaultLocation?: string | null, initialData?: any, settings?: any, user?: any }) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBumping, setIsBumping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const isEditing = !!initialData;

  // Grundläggande fält
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const initialCat = categories.flatMap(c => [c, ...(c.subcategories || [])]).find(c => c.id === (initialData?.categoryId || ""));
  const initialMainId = initialCat?.parentId ? initialCat.parentId : (initialCat?.id || "");
  const initialSubId = initialCat?.parentId ? initialCat.id : "";
  const initialSubSubId = ""; // Förenklad initiering för editering

  const [mainCategoryId, setMainCategoryId] = useState(initialMainId);
  const [subCategoryId, setSubCategoryId] = useState(initialSubId);
  const [subSubCategoryId, setSubSubCategoryId] = useState(initialSubSubId);
  
  const categoryId = subSubCategoryId || subCategoryId || mainCategoryId;

  const [location, setLocation] = useState(initialData?.location || "");
  const [zipCode, setZipCode] = useState(initialData?.zipCode || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || "");
  const [hidePhone, setHidePhone] = useState(initialData?.hidePhone || false);
  const [advertiserType, setAdvertiserType] = useState(initialData?.advertiserType || "Privat");

  // Fält som nu är globala (gäller alla kategorier)
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [files, setFiles] = useState<File[]>([]);

  // Bil-specifika fält
  const [mileage, setMileage] = useState(initialData?.mileage?.toString() || "");
  const [year, setYear] = useState(initialData?.year?.toString() || "");
  const [horsepower, setHorsepower] = useState(initialData?.horsepower?.toString() || "");
  const [color, setColor] = useState(initialData?.color || "");
  const [gearbox, setGearbox] = useState(initialData?.gearbox || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [fuel, setFuel] = useState(initialData?.fuel || "");
  const [drivetrain, setDrivetrain] = useState(initialData?.drivetrain || "");

  const selectedCategory = categories.flatMap(c => [c, ...(c.subcategories || [])]).find(c => c.id === categoryId);
  const isCar = selectedCategory?.name === "Bilar" || selectedCategory?.name === "Bil" || selectedCategory?.name === "Fordon";

  let adCost = 0;
  if (settings?.paymentsEnabled && !isEditing) {
    if (user?.accountType === "Företag") {
      // Företagspris: Använd unikt pris om det finns, annars generellt företagspris
      if (user.customCompanyAdPrice !== null && user.customCompanyAdPrice !== undefined) {
        adCost = user.customCompanyAdPrice;
      } else {
        adCost = settings.companyAdPrice || 0;
      }
    } else {
      // Privatpersonspris: Sök efter customPrice nerifrån och upp i kategoriträdet
      const subSubCat = categories.flatMap(c => c.subcategories || []).flatMap((s: any) => s.subcategories || []).find((s: any) => s.id === subSubCategoryId);
      const subCat = categories.flatMap(c => c.subcategories || []).find(c => c.id === subCategoryId);
      const mainCat = categories.find(c => c.id === mainCategoryId);

      if (subSubCat && subSubCat.customPrice !== null && subSubCat.customPrice !== undefined) {
        adCost = subSubCat.customPrice;
      } else if (subCat && subCat.customPrice !== null && subCat.customPrice !== undefined) {
        adCost = subCat.customPrice;
      } else if (mainCat && mainCat.customPrice !== null && mainCat.customPrice !== undefined) {
        adCost = mainCat.customPrice;
      } else {
        adCost = settings.defaultAdPrice || 0;
      }
    }
  }

  // Location Effect (Default Location or IP Geolocation)
  useEffect(() => {
    if (!location) {
      if (defaultLocation) {
        setLocation(defaultLocation);
      } else if (autoLocation) {
        fetch("https://ipinfo.io/json")
          .then(res => res.json())
          .then(data => {
            if (data.region) {
              const swedishCounties = ["Blekinge", "Dalarna", "Gotland", "Gävleborg", "Halland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Skåne", "Stockholm", "Södermanland", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland", "Örebro", "Östergötland"];
              const matchedCounty = swedishCounties.find(county => data.region.includes(county) || data.region === county);
              if (matchedCounty) {
                setLocation(matchedCounty);
              }
            }
          })
          .catch(() => {
            // Ignorera fel tyst
          });
      }
    }
  }, [defaultLocation, autoLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let uploadedUrls: string[] = [];

      // 1. Ladda upp bilder om de finns
      if (files.length > 0) {
        const formData = new FormData();
        
        // Ladda komprimeringsbiblioteket dynamiskt
        const imageCompression = (await import("browser-image-compression")).default;
        const compressionOptions = {
          maxSizeMB: 0.8, // Max 800 kB
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };

        for (const file of files) {
          try {
            const compressedFile = await imageCompression(file, compressionOptions);
            formData.append("files", compressedFile);
          } catch (error) {
            console.warn("Bildkomprimering misslyckades, använder originalbild", error);
            formData.append("files", file);
          }
        }
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error("Kunde inte ladda upp bilderna");
        
        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      // 2. Skapa eller Uppdatera annonsen
      const endpoint = "/api/ads";
      const method = isEditing ? "PUT" : "POST";
      
      const payload = {
        title, description, price: Number(price), categoryId, location, zipCode, city, phoneNumber, hidePhone, advertiserType,
        brand, imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined, // Behåll gamla om inga nya valdes i edit
        ...(isCar && {
          mileage: Number(mileage),
          year: Number(year),
          horsepower: Number(horsepower),
          color, gearbox, model, fuel, drivetrain
        }),
        isBumping: isEditing ? isBumping : undefined
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { adId: initialData.id, action: "fullEdit", data: payload } : payload)
      });

      if (!res.ok) throw new Error(`Kunde inte ${isEditing ? "uppdatera" : "skapa"} annonsen`);
      
      const data = await res.json();
      
      if (!isEditing && data.isPaid === false) {
        router.push(`/betala/${data.id}`);
      } else if (isEditing && data.isPaid === false) {
        // Om användaren valde "Nytt pris/Bump" och det kostar pengar
        // Skicka med paymentAmount i URL eller låt betalningssidan hantera ad:ens price.
        // Egentligen kräver nu databasen betalning (isPaid=false), så betalningssidan kommer att visas.
        // För bump-betalning vill vi kalla betala-sidan.
        router.push(`/betala/${data.id}?bump=true&amount=${data.paymentAmount}`);
      } else if (isEditing) {
        router.push(`/annons/${initialData.id}`);
      } else {
        router.push(`/dashboard/annonser`);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {error && <div style={{ color: "var(--color-error)", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)" }}>{error}</div>}

      <div className="grid-2-col">
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Titel</label>
          <input required type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Vad säljer du?" />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Huvudkategori</label>
            <select required className="input-field" value={mainCategoryId} onChange={e => { setMainCategoryId(e.target.value); setSubCategoryId(""); setSubSubCategoryId(""); }}>
              <option value="" disabled>Välj huvudkategori</option>
              {categories.map(mainCat => (
                <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
              ))}
            </select>
          </div>

          {mainCategoryId && categories.find(c => c.id === mainCategoryId)?.subcategories?.length > 0 && (
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Underkategori (Valfritt)</label>
              <select className="input-field" value={subCategoryId} onChange={e => { setSubCategoryId(e.target.value); setSubSubCategoryId(""); }}>
                <option value="">Ingen underkategori</option>
                {categories.find(c => c.id === mainCategoryId)?.subcategories.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          {subCategoryId && categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.subcategories?.length > 0 && (
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Detaljerad Kategori (Valfritt)</label>
              <select className="input-field" value={subSubCategoryId} onChange={e => setSubSubCategoryId(e.target.value)}>
                <option value="">Välj specifik kategori</option>
                {categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.subcategories.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Pris (kr)</label>
          <input required type="number" className="input-field" value={price} onChange={e => setPrice(e.target.value)} placeholder="T.ex. 50000" />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Län</label>
            <select required className="input-field" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">Välj län...</option>
              <option value="Blekinge">Blekinge</option>
              <option value="Dalarna">Dalarna</option>
              <option value="Gotland">Gotland</option>
              <option value="Gävleborg">Gävleborg</option>
              <option value="Halland">Halland</option>
              <option value="Jämtland">Jämtland</option>
              <option value="Jönköping">Jönköping</option>
              <option value="Kalmar">Kalmar</option>
              <option value="Kronoberg">Kronoberg</option>
              <option value="Norrbotten">Norrbotten</option>
              <option value="Skåne">Skåne</option>
              <option value="Stockholm">Stockholm</option>
              <option value="Södermanland">Södermanland</option>
              <option value="Uppsala">Uppsala</option>
              <option value="Värmland">Värmland</option>
              <option value="Västerbotten">Västerbotten</option>
              <option value="Västernorrland">Västernorrland</option>
              <option value="Västmanland">Västmanland</option>
              <option value="Västra Götaland">Västra Götaland</option>
              <option value="Örebro">Örebro</option>
              <option value="Östergötland">Östergötland</option>
              <option value="Hela Sverige">Hela Sverige</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Ort</label>
            <input required type="text" className="input-field" value={city} onChange={e => setCity(e.target.value)} placeholder="T.ex. Ramdala" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Postnummer</label>
            <input required type="text" className="input-field" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="T.ex. 37352" />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Märke (Valfritt men bra för sökbarhet)</label>
            <input type="text" className="input-field" value={brand} onChange={e => setBrand(e.target.value)} placeholder="T.ex. Apple, Volvo, Nike" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Telefonnummer (Krävs för Swish)</label>
            <input required type="tel" className="input-field" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="070-123 45 67" />
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={hidePhone} onChange={e => setHidePhone(e.target.checked)} />
              Dölj mitt nummer i annonsen (används bara för betalning)
            </label>
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Beskrivning</label>
          <textarea required className="input-field" rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Beskriv varan detaljerat..."></textarea>
        </div>

        <div style={{ gridColumn: "1 / -1", padding: "1rem", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-md)" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Bilder (Max 3 st)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={(e) => {
              if (e.target.files) {
                const selected = Array.from(e.target.files);
                if (selected.length > 3) {
                  showNotification("Du kan max välja 3 bilder.", "info");
                  setFiles(selected.slice(0, 3));
                } else {
                  setFiles(selected);
                }
              }
            }} 
            style={{ display: "block", width: "100%" }}
          />
          {files.length > 0 && (
            <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
              Valda filer: {files.map(f => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>

      {isCar && (
        <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
          <h3 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Fordonsspecifikationer</h3>
          <div className="grid-2-col">
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Modell</label>
              <input type="text" className="input-field" value={model} onChange={e => setModel(e.target.value)} placeholder="T.ex. S70" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Årsmodell</label>
              <input type="number" className="input-field" value={year} onChange={e => setYear(e.target.value)} placeholder="T.ex. 2018" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Miltal</label>
              <input type="number" className="input-field" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="T.ex. 15000" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Växellåda</label>
              <select className="input-field" value={gearbox} onChange={e => setGearbox(e.target.value)}>
                <option value="">Välj...</option>
                <option value="Automat">Automat</option>
                <option value="Manuell">Manuell</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Drivmedel</label>
              <select className="input-field" value={fuel} onChange={e => setFuel(e.target.value)}>
                <option value="">Välj...</option>
                <option value="Bensin">Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="El">El</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Färg</label>
              <input type="text" className="input-field" value={color} onChange={e => setColor(e.target.value)} placeholder="T.ex. Röd" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Hästkrafter</label>
              <input type="number" className="input-field" value={horsepower} onChange={e => setHorsepower(e.target.value)} placeholder="T.ex. 190" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Drivhjul</label>
              <select className="input-field" value={drivetrain} onChange={e => setDrivetrain(e.target.value)}>
                <option value="">Välj...</option>
                <option value="Framhjulsdrift">Framhjulsdrift</option>
                <option value="Bakhjulsdrift">Bakhjulsdrift</option>
                <option value="Fyrhjulsdrift">Fyrhjulsdrift</option>
              </select>
            </div>

          </div>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        {!isEditing && settings?.paymentsEnabled && (
          <div style={{ padding: "1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--color-border)" }}>
            <span style={{ fontWeight: 600 }}>Kostnad för att publicera:</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: adCost === 0 ? "var(--color-success)" : "var(--color-primary)" }}>
              {adCost === 0 ? "Gratis" : `${adCost} kr`}
            </span>
          </div>
        )}
        {isEditing && settings?.bumpEnabled && (
          <div style={{ padding: "1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", marginBottom: "1rem", border: "1px solid var(--color-border)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={isBumping}
                onChange={e => setIsBumping(e.target.checked)}
                style={{ width: "1.2rem", height: "1.2rem" }}
              />
              Uppdatera med nytt pris och flytta annonsen högst upp 
              <span style={{ color: "var(--color-primary)" }}>(Kostnad: {settings.bumpPrice || 0} kr)</span>
            </label>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginLeft: "1.95rem" }}>
              När du sänker priset på din annons kan du välja detta för att annonsen ska hanteras som helt ny och hamna överst i sökresultaten igen.
            </p>
          </div>
        )}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="button" onClick={() => setShowPreview(true)} className="btn-secondary" style={{ flex: 1, padding: "1rem", fontSize: "1.1rem" }}>
            Förhandsgranska
          </button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: "1rem", fontSize: "1.1rem" }}>
            {loading ? "Sparar..." : (isEditing ? "Spara Ändringar" : "Publicera Annons")}
          </button>
        </div>
      </div>

      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ backgroundColor: 'white', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
            <button type="button" onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-bg-subtle)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>{title || "Din annons rubrik"}</h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{price ? `${price} kr` : "Pris ej angivet"}</div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="search-pill" style={{ padding: '0.5rem 1rem', borderRadius: '50px', background: 'var(--color-bg-subtle)' }}>📍 {location || "Län"}, {city || "Ort"}</span>
                <span className="search-pill" style={{ padding: '0.5rem 1rem', borderRadius: '50px', background: 'var(--color-bg-subtle)' }}>📅 {new Date().toLocaleDateString()}</span>
                {brand && <span className="search-pill" style={{ padding: '0.5rem 1rem', borderRadius: '50px', background: 'var(--color-bg-subtle)' }}>🏷️ {brand}</span>}
              </div>

              {files.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem' }}>
                  {files.map((file, i) => (
                    <img key={i} src={URL.createObjectURL(file)} alt="Preview" style={{ height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  ))}
                </div>
              )}

              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '2rem' }}>
                {description || "Din beskrivning kommer att visas här."}
              </div>

              {isCar && (
                <div style={{ background: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Fordonsspecifikationer</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {model && <div><strong>Modell:</strong> {model}</div>}
                    {year && <div><strong>Årsmodell:</strong> {year}</div>}
                    {mileage && <div><strong>Miltal:</strong> {mileage}</div>}
                    {gearbox && <div><strong>Växellåda:</strong> {gearbox}</div>}
                    {fuel && <div><strong>Drivmedel:</strong> {fuel}</div>}
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setShowPreview(false)} className="btn-secondary">Stäng förhandsgranskning</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
