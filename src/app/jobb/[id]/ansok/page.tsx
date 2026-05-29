"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";

export default function ApplyJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [coverLetterUrl, setCoverLetterUrl] = useState("");

  useEffect(() => {
    // Fetch job title and company name
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobb/${resolvedParams.id}`);
        const data = await res.json();
        if (res.ok && data) {
          setJobTitle(data.title);
          setCompanyName(data.companyName);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // In a real app we'd upload to Supabase/S3 here
    // For now we use the same upload route as images, or a dedicated one.
    // Assuming /api/upload supports PDFs
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setUrl(data.url);
      } else {
        alert("Något gick fel vid uppladdningen. Säkerställ att det är ett giltigt format.");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Något gick fel vid uppladdningen.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvUrl || !coverLetterUrl) {
      return alert("Du måste ladda upp både CV och personligt brev.");
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobb/${resolvedParams.id}/ansok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          cvUrl,
          coverLetterUrl
        })
      });
      
      if (res.ok) {
        alert("Din ansökan har skickats!");
        router.push(`/jobb/${resolvedParams.id}?applied=true`);
      } else {
        const data = await res.json();
        alert(data.error || "Ett fel uppstod när ansökan skulle skickas.");
      }
    } catch (e) {
      console.error(e);
      alert("Något gick fel.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <BackButton label={`Tillbaka till annonsen`} />
      
      <div className="glass-panel" style={{ padding: "2rem", marginTop: "1rem" }}>
        <h1 style={{ fontSize: "1.8rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Ansökan</h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
          Du ansöker till tjänsten <strong>{jobTitle}</strong> hos <strong>{companyName}</strong>.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="grid-2-col">
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>För- och efternamn *</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>E-postadress *</label>
              <input 
                type="email" 
                className="input-field" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Telefonnummer</label>
            <input 
              type="tel" 
              className="input-field" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>

          <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Bifoga filer</h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>CV (PDF/Word) *</label>
              {cvUrl ? (
                <div style={{ color: "var(--color-success)", fontWeight: 500 }}>✓ Fil uppladdad</div>
              ) : (
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={e => handleUpload(e, setCvUrl)} 
                  required 
                />
              )}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Personligt Brev (PDF/Word) *</label>
              {coverLetterUrl ? (
                <div style={{ color: "var(--color-success)", fontWeight: 500 }}>✓ Fil uppladdad</div>
              ) : (
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={e => handleUpload(e, setCoverLetterUrl)} 
                  required 
                />
              )}
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Ett kort meddelande (Frivilligt)</label>
            <textarea 
              className="input-field" 
              rows={4} 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Skriv några rader om varför du söker tjänsten..."
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary" 
            style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "1rem" }}
          >
            {submitting ? "Skickar ansökan..." : "Skicka Ansökan"}
          </button>
        </form>
      </div>
    </div>
  );
}
