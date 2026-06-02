// Shared GTA-V Leaflet map. Originally lived in dirk_fishing's Book/Map/
// MapHandler.tsx — lifted here so every consumer that wants an admin or
// guidebook map (druglabsv2 lab placement, fishing guidebook, future
// scripts) renders the same tile layer + zoom + bounds without copying
// 100 lines per repo.
//
// Use:
//   <Map initialCenter={gameToMap(myPos.x, myPos.y)}>
//     <ZoomControls/>
//     {markers}
//   </Map>
//
// Pair with <BlipMarker> for the standard GTA blip-as-marker. Custom
// markers stay possible via @adamscybot/react-leaflet-component-marker's
// <Marker icon={<jsx/>} /> pattern; this file only owns the container +
// tile layer + zoom widget.
import { alpha, useMantineTheme } from "@mantine/core";
import { CRS, latLng, latLngBounds, Map as LeafletMapType, tileLayer, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Minus, Plus } from "lucide-react";
import { memo, ReactNode, useEffect, useRef } from "react";
import { MapContainer, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { gameToMap } from "../../utils/map";

export type MapStyle = "game" | "render" | "print";

export type MapProps = {
  children?: ReactNode;
  initialZoom?: number;
  initialCenter?: [number, number];
  mapStyle?: MapStyle;
  className?: string;
};

const MapImpl = memo(({
  children,
  initialZoom = 2.0,
  initialCenter = gameToMap(0, 0),
  mapStyle = "game",
}: MapProps) => {
  const mapRef = useRef<LeafletMapType | null>(null);

  return (
    <MapContainer
      maxBoundsViscosity={1.0}
      preferCanvas={true}
      zoom={Math.round(initialZoom)}
      zoomSnap={1}
      zoomDelta={1}
      zoomControl={false}
      crs={CRS.Simple}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        outline: 'none !important',
        border: 'none !important',
        boxShadow: 'none !important',
        backgroundColor: '#384950',
      }}
      center={initialCenter}
      attributionControl={false}
      doubleClickZoom={false}
      inertia={false}
      zoomAnimation={false}
      ref={mapRef}
      maxBounds={[[-250, -250], [250, 250]]}
    >
      <MapLayer mapLayer={mapStyle} />
      {children}
    </MapContainer>
  );
});
MapImpl.displayName = 'DirkMap';

export const Map = MapImpl;

// ── Tile layer ──────────────────────────────────────────────────────────────
// Pulls Rockstar's hosted GTA-V tile pyramid. `game` is the standard
// in-game map, `render` is the higher-detail satellite-style, `print` is
// the cartographic/printable variant.

type MapLayerProps = {
  mapLayer: MapStyle;
};

export const MapLayer = ({ mapLayer }: MapLayerProps) => {
  const map = useMap();
  const layerRef = useRef<TileLayer | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    const layer = tileLayer(
      `https://s.rsg.sc/sc/images/games/GTAV/map/${mapLayer}/{z}/{x}/{y}.jpg`,
      {
        maxZoom: 6,
        minZoom: 4,
        bounds: latLngBounds(latLng(0.0, 128.0), latLng(-192.0, 0.0)),
        tileSize: 256,
        updateWhenZooming: false,
        keepBuffer: 2,
        opacity: 0.75,
      }
    );
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [mapLayer, map]);

  return null;
};

// ── ZoomControls ────────────────────────────────────────────────────────────
// Generic + / − widget pinned top-right. Must be rendered inside <Map>.

export function ZoomControls() {
  const theme = useMantineTheme();
  const map = useMap();
  const buttons = [
    { Icon: Plus, fn: () => map.zoomIn() },
    { Icon: Minus, fn: () => map.zoomOut() },
  ];

  return (
    <motion.div
      style={{
        position: 'absolute',
        right: '2vh',
        top: '2vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999999,
        boxShadow: `0 0 1vh ${alpha(theme.colors.dark[9], 0.85)}`,
        background: alpha(theme.colors.dark[9], 0.85),
        borderRadius: theme.radius.xs,
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {buttons.map(({ Icon, fn }, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.1, filter: 'brightness(1.5)' }}
          onClick={fn}
          style={{
            padding: theme.spacing.xs,
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <Icon size={34} color={theme.colors.gray[5]} />
        </motion.div>
      ))}
    </motion.div>
  );
}
