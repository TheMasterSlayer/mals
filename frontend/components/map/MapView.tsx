'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { CircleMarker as LeafletCircleMarker } from 'leaflet';
import type { Asset, AssetStatus } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE:      '#22C55E',
  IN_USE:         '#00B4D8',
  MAINTENANCE:    '#F59E0B',
  DEPLOYED:       '#7C3AED',
  DECOMMISSIONED: '#64748B',
};

interface FlyToProps {
  lat: number;
  lng: number;
  assetId: number;
  markerRefs: React.MutableRefObject<Map<number, LeafletCircleMarker>>;
}

function FlyToMarker({ lat, lng, assetId, markerRefs }: FlyToProps) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.2 });
    // Open popup after the fly animation finishes
    const timer = setTimeout(() => {
      markerRefs.current.get(assetId)?.openPopup();
    }, 1300);
    return () => clearTimeout(timer);
  }, [lat, lng, assetId, map, markerRefs]);
  return null;
}

interface Props {
  assets: Asset[];
  focusId?: number;
  focusLat?: number;
  focusLng?: number;
}

export default function MapView({ assets, focusId, focusLat, focusLng }: Props) {
  const markerRefs = useRef<Map<number, LeafletCircleMarker>>(new Map());
  const withCoords = assets.filter(a => a.latitude != null && a.longitude != null);

  const center: [number, number] = focusLat != null && focusLng != null
    ? [focusLat, focusLng]
    : withCoords.length > 0
      ? [withCoords[0].latitude!, withCoords[0].longitude!]
      : [35, -80];

  const initialZoom = focusLat != null ? 10 : 5;

  return (
    <MapContainer
      center={center}
      zoom={initialZoom}
      style={{ height: '540px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {focusId != null && focusLat != null && focusLng != null && (
        <FlyToMarker lat={focusLat} lng={focusLng} assetId={focusId} markerRefs={markerRefs} />
      )}

      {withCoords.map(asset => (
        <CircleMarker
          key={asset.id}
          ref={el => { if (el) markerRefs.current.set(asset.id, el); }}
          center={[asset.latitude!, asset.longitude!]}
          radius={asset.id === focusId ? 14 : 10}
          pathOptions={{
            color: STATUS_COLORS[asset.status],
            fillColor: STATUS_COLORS[asset.status],
            fillOpacity: asset.id === focusId ? 1 : 0.8,
            weight: asset.id === focusId ? 3 : 2,
          }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong>{asset.name}</strong>
              <br />
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{asset.type}</span>
              <br /><br />
              <div>Status: <strong>{asset.status.replace('_', ' ')}</strong></div>
              <div>Qty: <strong>{asset.quantity}</strong></div>
              {asset.location && <div>Location: {asset.location}</div>}
              {asset.assignedTo && <div>Assigned: {asset.assignedTo}</div>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
