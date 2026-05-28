import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Home() {
  const categories = await prisma.category.findMany({
    where: { parentId: null }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <section 
        className="glass-panel animate-fade-in" 
        style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
          border: '1px solid var(--color-border)'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          Hitta det du söker, exakt.
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Slipp bruset. Sök på det du vill ha och få bara upp exakta träffar. Välkommen till en renare marknadsplats.
        </p>
        
        {/* Search Bar */}
        <form action="/sok" method="GET" style={{ display: 'flex', gap: '0.5rem', maxWidth: '700px', margin: '0 auto' }}>
          <input 
            type="text" 
            name="q"
            placeholder="Vad letar du efter? (ex. soffa, cykel)" 
            className="input-field"
            style={{ padding: '1rem', fontSize: '1.1rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Sök exakt
          </button>
        </form>
      </section>

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
