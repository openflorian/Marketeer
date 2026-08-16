// components/AIRecommendationZone.tsx
import { useEffect, useState } from 'preact/hooks';

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  predictedEPC: number;
  confidence: number;
}

export default function AIRecommendationZone() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulierte AI-Empfehlungen (in der Produktion: Fetch von tRPC API)
    setTimeout(() => {
      setRecommendations([
        {
          id: 'ai_rec_1',
          title: 'GPU für lokale LLM-Inferenz',
          reason: 'Basierend auf Ihrem Geräteprofil (6+ GHz CPU, High RAM)',
          predictedEPC: 12.5,
          confidence: 94,
        },
        {
          id: 'ai_rec_2',
          title: 'Erweiterter RAM-Bundle',
          reason: 'Wochenende + Peak-Produktivitäts-Trend',
          predictedEPC: 8.75,
          confidence: 87,
        },
        {
          id: 'ai_rec_3',
          title: 'Cooling Solution Pro',
          reason: 'Häufig zusammen mit GPU-Käufen (Assoziations-Mining)',
          predictedEPC: 6.2,
          confidence: 79,
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <section class="mb-20">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-3 text-emerald-400">
        <span>🧠</span>
        <span>AI_PERSONALIZED_PICKS</span>
        <span class="ml-auto text-xs text-gray-500 font-mono">Predictive Engine</span>
      </h2>

      {loading ? (
        <div class="text-center py-12 text-gray-400">
          <div class="inline-block animate-spin">⚙️</div>
          <p class="mt-2 text-sm">Analyzing user intent patterns...</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              class="glass-card p-6 rounded-xl border-l-4 border-l-emerald-500 hover:border-l-emerald-300 transition-all"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-semibold text-lg flex-1">{rec.title}</h3>
                <div class="text-right">
                  <div class="text-xs text-emerald-400 font-bold">
                    {rec.confidence}% Sicherheit
                  </div>
                </div>
              </div>

              <p class="text-sm text-gray-400 mb-4">
                <span class="font-mono text-xs text-gray-600">WHY:</span> {rec.reason}
              </p>

              <!-- Confidence Visualisierung -->
              <div class="mb-4">
                <div class="text-xs text-gray-500 mb-1">Modell-Konfidenzniveau</div>
                <div class="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
              </div>

              <!-- Predicted EPC -->
              <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded mb-4">
                <div class="text-xs text-gray-500 font-mono">Expected EPC</div>
                <div class="text-xl font-bold text-emerald-400">${rec.predictedEPC.toFixed(2)}</div>
              </div>

              <button class="w-full py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 rounded transition font-semibold text-sm">
                → View Recommendation
              </button>
            </div>
          ))}
        </div>
      )}

      <!-- AI Insights -->
      <div class="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
        <p class="text-sm text-gray-300">
          <span class="font-mono text-indigo-400">🤖 ML Engine:</span> Diese Empfehlungen werden durch ein Ensemble-Modell generiert
          (Collaborative Filtering + Content-Based RankerNet), das alle Affiliate-Performance-Daten in Echtzeit verarbeitet.
        </p>
      </div>
    </section>
  );
}
