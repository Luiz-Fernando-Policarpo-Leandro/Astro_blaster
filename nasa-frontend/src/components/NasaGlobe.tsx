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
      
      // === Camadas base ===
      // Adicionamos apenas a camada base uniforme para evitar artefatos quadriculados do Landsat
      const baseLayer = new WorldWind.BMNGLayer();
      wwd.addLayer(baseLayer);

      // Ferramentas padrão
      wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
      wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

      // Posição inicial
      wwd.navigator.lookAtLocation.latitude = 0;
      wwd.navigator.lookAtLocation.longitude = 0;
      wwd.navigator.range = 2.1e7;
      wwd.navigator.tilt = 0;
      wwd.navigator.heading = 0;
      wwd.redraw();

      // === Camada de impactos ===
      const impactLayer = new WorldWind.RenderableLayer("Meteor Impacts");
      impactLayerRef.current = impactLayer;
      wwd.addLayer(impactLayer);

      // === Camada de nomes de países ===
      const countryLayer = new WorldWind.RenderableLayer("Country Labels");

      const placemarkAttrs = new WorldWind.PlacemarkAttributes(null);
      placemarkAttrs.imageScale = 0;
      placemarkAttrs.labelAttributes = new WorldWind.TextAttributes(null);
      placemarkAttrs.labelAttributes.color = WorldWind.Color.WHITE;

      // CORREÇÃO: Usar CENTER para X e Y para garantir que o texto apareça centralizado
      placemarkAttrs.labelAttributes.offset = new WorldWind.Offset(
        WorldWind.Offset.CENTER,
        WorldWind.Offset.CENTER
      );

      const countries = [
        { name: "Brasil", lat: -10, lon: -55 },
        { name: "Argentina", lat: -35, lon: -65 },
        { name: "Chile", lat: -30, lon: -71 },
        { name: "Peru", lat: -10, lon: -75 },
        { name: "Colômbia", lat: 4, lon: -74 },
        { name: "Venezuela", lat: 7, lon: -66 },
        { name: "Paraguai", lat: -23, lon: -58 },
        { name: "Uruguai", lat: -33, lon: -56 },
        { name: "Bolívia", lat: -17, lon: -65 },
        { name: "Equador", lat: -1, lon: -78 },
      ];

      countries.forEach((c) => {
        const placemark = new WorldWind.Placemark(
          new WorldWind.Position(c.lat, c.lon, 0),
          false,
          placemarkAttrs
        );
        placemark.label = c.name;
        countryLayer.addRenderable(placemark);
      });

      wwd.addLayer(countryLayer);
      
      // CORREÇÃO: Adicionar a camada de atmosfera por último para renderizar o glow corretamente
      const atmosphereLayer = new WorldWind.AtmosphereLayer();
      atmosphereLayer.opacity = 0.55; // Opacidade ligeiramente ajustada para melhor efeito
      wwd.addLayer(atmosphereLayer);
      // === Luz solar dinâmica ===
      wwd.sunShading = true; // ativa sombreamento baseado na posição do sol
      wwd.redraw();

      // === Eventos de clique ===
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

      // Resize handler
      const handleResize = () => {
        if (!wwd) return;
        wwd.redraw();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });
  }, []);

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