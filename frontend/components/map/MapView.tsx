'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { Asset, AssetStatus } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE:      '#22C55E',
  IN_USE:         '#00B4D8',
  MAINTENANCE:    '#F59E0B',
  DEPLOYED:       '#7C3AED',
  DECOMMISSIONED: '#64748B',
};

interface Props {
  assets: Asset[];
}

export default function MapView({ assets }: Props) {
  const withCoords = assets.filter(a => a.latitude != null && a.longitude != null);

  // Center on first asset or world center
  const center: [number, number] = withCoords.length > 0
    ? [withCoords[0].latitude!, withCoords[0].longitude!]
    : [35, -80];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '540px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {withCoords.map(asset => (
        <CircleMarker
          key={asset.id}
          center={[asset.latitude!, asset.longitude!]}
          radius={10}
          pathOptions={{
            color: STATUS_COLORS[asset.status],
            fillColor: STATUS_COLORS[asset.status],
            fillOpacity: 0.8,
            weight: 2,
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
