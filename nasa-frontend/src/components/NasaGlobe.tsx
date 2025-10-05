"use client";
import { useEffect, useRef, useState } from "react";

type Asteroid = {
  id: string;
  name: string;
  diameter_km: number;
  velocity_kms: number;
};

const ASTEROIDS: Asteroid[] = [
  { id: "apophis", name: "Apophis", diameter_km: 0.37, velocity_kms: 30 },
  { id: "bennu", name: "Bennu", diameter_km: 0.49, velocity_kms: 28 },
  { id: "didymos", name: "Didymos", diameter_km: 0.78, velocity_kms: 23 },
];

function impactRadiusMeters(a: Asteroid) {
  const r = a.diameter_km * 80_000;
  return Math.min(r, 1_000_000);
}

export default function NasaGlobe() {
  const globeRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wwdRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const impactLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realisticLayerRef = useRef<any>(null);

  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(null);
  const [realisticMode, setRealisticMode] = useState(false);

  // Corrige pixelado (HiDPI)
  function applyHiDPICanvas(canvas: HTMLCanvasElement, wwd: { redraw: () => void }) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      wwd.redraw();
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !globeRef.current) return;
    const canvas = document.getElementById("canvasOne") as HTMLCanvasElement | null;
    if (!canvas) return;

    import("worldwindjs").then((WorldWind) => {
      const WW = WorldWind;
      WW.configuration.baseUrl = "https://worldwindjs.org/worldwindjs";

      const wwd = new WW.WorldWindow("canvasOne");
      wwdRef.current = wwd;

      // Camada base leve (Blue Marble)
      const base = new WW.BMNGLayer();
      base.displayName = "Blue Marble";
      baseLayerRef.current = base;
      wwd.addLayer(base);

      // Camada realista (Landsat)
      const landsat = new WW.BMNGLandsatLayer();
      landsat.displayName = "Landsat Realistic";
      landsat.enabled = false;
      realisticLayerRef.current = landsat;
      wwd.addLayer(landsat);

      // Atmosfera e luz solar
      const atmosphere = new WW.AtmosphereLayer();
      atmosphere.opacity = 0.55;
      wwd.addLayer(atmosphere);
      wwd.sunShading = true;

      // HUD
      wwd.addLayer(new WW.CoordinatesDisplayLayer(wwd));
      wwd.addLayer(new WW.ViewControlsLayer(wwd));

      // Impactos
      const impacts = new WW.RenderableLayer("Meteor Impacts");
      impactLayerRef.current = impacts;
      wwd.addLayer(impacts);

      // Config inicial
      wwd.navigator.lookAtLocation.latitude = 0;
      wwd.navigator.lookAtLocation.longitude = 0;
      wwd.navigator.range = 2.1e7;
      applyHiDPICanvas(canvas, wwd);
      wwd.redraw();

      // Interação (clique no globo)
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };

      canvas.addEventListener("mousedown", (e) => {
        isDragging = false;
        dragStart = { x: e.clientX, y: e.clientY };
      });

      canvas.addEventListener("mousemove", (e) => {
        const dx = Math.abs(e.clientX - dragStart.x);
        const dy = Math.abs(e.clientY - dragStart.y);
        if (dx > 5 || dy > 5) isDragging = true;
      });

      canvas.addEventListener("mouseup", (event) => {
        if (isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pick = wwd.pickTerrain(wwd.canvasCoordinates(x, y));
        const hit =
          pick?.objects?.length && pick.objects[0].position ? pick.objects[0].position : null;
        if (!hit) return;

        const selected = (
          document.querySelector('input[name="asteroid"]:checked') as HTMLInputElement
        )?.value;
        const asteroid = ASTEROIDS.find((a) => a.id === selected);
        if (!asteroid) return;

        const radius = impactRadiusMeters(asteroid);
        const attrs = new WW.ShapeAttributes(null);
        attrs.drawInterior = true;
        attrs.drawOutline = true;
        attrs.interiorColor = new WW.Color(1, 0, 0, 0.25);
        attrs.outlineColor = new WW.Color(1, 0, 0, 0.9);
        attrs.outlineWidth = 2;

        const impact = new WW.SurfaceCircle(hit, radius, attrs);
        impacts.addRenderable(impact);
        wwd.redraw();
      });

      window.addEventListener("resize", () => applyHiDPICanvas(canvas, wwd));
    });
  }, []);

  // Alterna modo realista (sem crash)
  const toggleRealisticMode = () => {
    const wwd = wwdRef.current;
    if (!wwd) return;

    const newMode = !realisticMode;
    setRealisticMode(newMode);

    if (newMode) {
      if (baseLayerRef.current) baseLayerRef.current.enabled = false;
      if (realisticLayerRef.current) realisticLayerRef.current.enabled = true;
    } else {
      if (baseLayerRef.current) baseLayerRef.current.enabled = true;
      if (realisticLayerRef.current) realisticLayerRef.current.enabled = false;
    }
    wwd.redraw();
  };

  // Limpa impactos
  const clearImpacts = () => {
    if (impactLayerRef.current && wwdRef.current) {
      impactLayerRef.current.removeAllRenderables();
      wwdRef.current.redraw();
    }
  };

  const handleAlert = (asteroidName: string, asteroidId: string) => {
    setSelectedAsteroidId(asteroidId);
    alert(`🔔 Alerta ativado para ${asteroidName}!`);
  };

  // Helpers da tabela
  const formatRisk = (dKm: number) => (dKm < 0.4 ? "Baixo" : dKm < 0.7 ? "Médio" : "Alto");
  const riskColor = (risk: string) =>
    risk === "Baixo" ? "#4caf50" : risk === "Médio" ? "#fbc02d" : "#d32f2f";
  const asteroidDate = (id: string) =>
    id === "apophis" ? "2029-04-13" : id === "bennu" ? "2135-09-17" : "2025-10-07";
  const fakeDistance = (dKm: number) => `${(dKm * 1.2).toFixed(2)} mi km`;

  return (
    <div
      ref={globeRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle at center, #02030a 0%, #000000 70%)",
        overflow: "hidden",
        position: "relative",
        cursor: "grab",
      }}
    >
      <canvas id="canvasOne" style={{ width: "100%", height: "100%", display: "block" }} />

      {/* Painel lateral */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 360,
          background: "rgba(20,20,20,0.78)",
          borderRadius: 12,
          padding: 12,
          color: "#fff",
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          backdropFilter: "blur(4px)",
        }}
      >
        <button
          onClick={clearImpacts}
          style={{
            padding: "10px 14px",
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Limpar Impactos
        </button>

        <button
          onClick={toggleRealisticMode}
          style={{
            padding: "10px 14px",
            background: realisticMode ? "#2e7d32" : "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🌍 Modo Realista: {realisticMode ? "ON" : "OFF"}
        </button>

        <div style={{ fontSize: 14 }}>
          Selecione um asteroide e clique no globo para marcar o impacto.
        </div>

        {/* ===== Tabela ===== */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 0.8fr 0.9fr 0.7fr 0.9fr 1fr",
              gap: 8,
              padding: "8px 10px",
              background: "rgba(255,255,255,0.07)",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            <div>Nome</div>
            <div>Tam. (km)</div>
            <div>Data</div>
            <div>Risco</div>
            <div>Distância</div>
            <div>Alerta</div>
          </div>

          <div style={{ maxHeight: "42vh", overflowY: "auto" }}>
            {ASTEROIDS.map((a) => {
              const risk = formatRisk(a.diameter_km);
              return (
                <div
                  key={a.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 0.8fr 0.9fr 0.7fr 0.9fr 1fr",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="radio"
                      name="asteroid"
                      value={a.id}
                      checked={selectedAsteroidId === a.id}
                      onChange={() => setSelectedAsteroidId(a.id)}
                      style={{ cursor: "pointer", accentColor: "#2196f3" }}
                    />
                    {a.name}
                  </div>
                  <div>{a.diameter_km}</div>
                  <div>{asteroidDate(a.id)}</div>
                  <div>
                    <span
                      style={{
                        background: `${riskColor(risk)}22`,
                        color: riskColor(risk),
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      {risk}
                    </span>
                  </div>
                  <div>{fakeDistance(a.diameter_km)}</div>
                  <div>
                    <button
                      onClick={() => handleAlert(a.name, a.id)}
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Receber alerta
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
