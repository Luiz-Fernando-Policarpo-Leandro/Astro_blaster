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

// regra simples de escala de impacto (exemplo)
function impactRadiusMeters(a: Asteroid) {
  const r = a.diameter_km * 80_000; // 80 km de raio por km de diâmetro
  return Math.min(r, 1_000_000); // limite máximo 1.000 km
}

export default function NasaGlobe() {
  const globeRef = useRef<HTMLDivElement>(null);
  const wwdRef = useRef<any>(null);
  const impactLayerRef = useRef<any>(null);
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !globeRef.current) return;
    const canvasElement = document.getElementById("canvasOne") as HTMLCanvasElement | null;
    if (!canvasElement) return;

    import("worldwindjs").then((WorldWind) => {
      WorldWind.configuration.baseUrl = "https://worldwindjs.org/worldwindjs";

      const wwd = new WorldWind.WorldWindow("canvasOne");
      wwdRef.current = wwd;

      // camadas básicas
      wwd.addLayer(new WorldWind.BMNGLayer());
      wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
      wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

      // posição inicial (centralizada)
      wwd.navigator.lookAtLocation.latitude = 0;
      wwd.navigator.lookAtLocation.longitude = 0;
      wwd.navigator.range = 2.1e7;
      wwd.navigator.tilt = 0;
      wwd.navigator.heading = 0;
      wwd.redraw();

      // camada de impactos
      const impactLayer = new WorldWind.RenderableLayer("Meteor Impacts");
      impactLayerRef.current = impactLayer;
      wwd.addLayer(impactLayer);

      // ===== clique inteligente =====
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };

      canvasElement.addEventListener("mousedown", (e) => {
        isDragging = false;
        dragStart = { x: e.clientX, y: e.clientY };
      });

      canvasElement.addEventListener("mousemove", (e) => {
        const dx = Math.abs(e.clientX - dragStart.x);
        const dy = Math.abs(e.clientY - dragStart.y);
        if (dx > 5 || dy > 5) isDragging = true;
      });

      canvasElement.addEventListener("mouseup", (event) => {
        if (isDragging) return;
        if (!WorldWind.ShapeAttributes || !WorldWind.Color) return;

        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const terrain = wwd.pickTerrain(wwd.canvasCoordinates(x, y));
        const hit =
          terrain?.objects?.length && terrain.objects[0].position
            ? terrain.objects[0].position
            : null;
        if (!hit) return;

        // usa o asteroide selecionado atual
        const asteroid = ASTEROIDS.find(
          (a) =>
            a.id ===
            (document.querySelector('input[name="asteroid"]:checked') as HTMLInputElement)?.value
        );
        if (!asteroid) return;

        const radiusM = impactRadiusMeters(asteroid);
        const attrs = new WorldWind.ShapeAttributes(null);
        attrs.interiorColor = new WorldWind.Color(1, 0, 0, 0.25);
        attrs.outlineColor = new WorldWind.Color(1, 0, 0, 1);
        const impact = new WorldWind.SurfaceCircle(hit, radiusM, attrs);
        impactLayer.addRenderable(impact);
        wwd.redraw();
      });

      // ===== resize seguro (sem recriar buffer) =====
      const handleResize = () => {
        if (!wwd) return;
        wwd.redraw();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });
  }, []); // inicializa só uma vez (sem refazer o globo)

  // limpar impactos
  const clearImpacts = () => {
    if (impactLayerRef.current && wwdRef.current) {
      impactLayerRef.current.removeAllRenderables();
      wwdRef.current.redraw();
    }
  };

  return (
    <div
      ref={globeRef}
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
        position: "relative",
        cursor: "grab",
      }}
    >
      <canvas id="canvasOne" style={{ width: "100%", height: "100%", display: "block" }} />

      {/* painel lateral */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 320,
          maxHeight: "80vh",
          padding: 12,
          borderRadius: 12,
          background: "rgba(20,20,20,0.75)",
          backdropFilter: "blur(4px)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
          color: "#fff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          zIndex: 10,
        }}
      >
        <button
          onClick={clearImpacts}
          style={{
            padding: "10px 14px",
            backgroundColor: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        >
          Limpar Impactos
        </button>

        <div style={{ fontSize: 14, opacity: 0.9 }}>
          Selecione um asteroide e clique no globo para marcar o impacto.
        </div>

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
              gridTemplateColumns: "1fr 80px 80px 32px",
              gap: 8,
              padding: "8px 10px",
              background: "rgba(255,255,255,0.07)",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            <div>Asteroide</div>
            <div>Diâm. (km)</div>
            <div>Vel. (km/s)</div>
            <div />
          </div>

          <div
            style={{
              maxHeight: "42vh",
              overflowY: "auto",
              scrollbarWidth: "thin",
            }}
          >
            {ASTEROIDS.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 80px 32px",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 10px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 13,
                }}
              >
                <div>{a.name}</div>
                <div>{a.diameter_km}</div>
                <div>{a.velocity_kms}</div>
                <div style={{ textAlign: "center" }}>
                  <input
                    type="radio"
                    name="asteroid"
                    value={a.id}
                    checked={selectedAsteroidId === a.id}
                    onChange={() => setSelectedAsteroidId(a.id)}
                    style={{ cursor: "pointer" }}
                    title="Selecionar"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.85,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: selectedAsteroidId ? "#4caf50" : "#fbc02d",
              borderRadius: 999,
            }}
          />
          {selectedAsteroidId
            ? "Modo: lançamento ativo (clique no globo)"
            : "Selecione um asteroide para lançar"}
        </div>
      </div>
    </div>
  );
}
