"use client";

import { useState } from "react";
import VoiceRecorder, { SearchResult } from "@/components/VoiceRecorder";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-screen bg-cover bg-center flex items-center"
        style={{ backgroundImage: "url('/ATLAS_final.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-6 flex justify-end">
          <div className="max-w-lg text-right">
            <h1 className="text-5xl font-bold text-white mb-2">
              <span className="text-2xl font-normal block mb-1">Hi, I am</span>
              Atlas.
            </h1>
            <h2 className="text-xl text-gray-200 mb-6">
              Your personal voice grocery assistant.
            </h2>

            <VoiceRecorder onResults={setResults} />

            {results.length === 0 && (
              <p className="text-gray-300 text-sm mt-6">
                Press the button, say each item you want to find, then say{" "}
                <strong>&ldquo;done&rdquo;</strong>.
              </p>
            )}

            <div className="mt-12 flex justify-end items-center gap-2">
              <span className="text-gray-300 text-sm">Check my code out here</span>
              <a
                href="https://github.com/iffataz/Atlas"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/github.png"
                  alt="GitHub"
                  width={32}
                  height={32}
                  className="invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section className="bg-gray-50 py-12 px-6">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Results
            </h2>
            <div className="space-y-10">
              {results.map(({ term, products }) => (
                <div key={term}>
                  <h3 className="text-lg font-semibold text-atlas capitalize mb-4 border-b border-atlas/20 pb-2">
                    {term}
                  </h3>
                  {products.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No products found for &ldquo;{term}&rdquo;.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {products.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
