import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import InstallAppBox from "@/components/InstallAppBox";

const prisma = new PrismaClient();

export default async function Home() {
  const categories = await prisma.category.findMany({
    where: { parentId: null }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <section 
        style={{ 
          position: "relative",
          padding: '5rem 2rem', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "100%", height: "200%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 50%)", pointerEvents: "none" }}></div>
        <div style={{ position: "relative", zIndex: 10 }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.25rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.04em' }}>
            Hitta det du söker, <span style={{ color: "var(--color-primary)" }}>exakt.</span>
          </h1>
          <p style={{ fontSize: '1.35rem', color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 3rem auto', fontWeight: 400, lineHeight: 1.6 }}>
            Slipp bruset. Sök på det du vill ha och få bara upp exakta träffar. Välkommen till en renare marknadsplats.
          </p>
          
          {/* Search Bar */}
          <form action="/sok" method="GET" style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap', 
              maxWidth: '750px', 
              margin: '0 auto', 
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              padding: '0.75rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
            <input 
              type="text" 
              name="q"
              placeholder="Vad letar du efter? (ex. soffa, cykel)" 
              className="input-field"
              style={{ padding: '1.25rem', fontSize: '1.15rem', flex: '1 1 300px', border: 'none', borderRadius: '0.5rem', background: '#ffffff' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.15rem', borderRadius: '0.5rem' }}>
              Sök
            </button>
            <Link href="/sok" className="btn-secondary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '0.5rem' }}>
              Ta mig till annonserna
            </Link>
          </form>
        </div>
      </section>

      <InstallAppBox />

      {/* Categories */}
      <section style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Kategorier</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/sok?category=${category.id}`} 
              className="glass-panel search-pill" 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', color: 'var(--color-primary)', fontWeight: 500, transition: 'all 0.2s' }}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
