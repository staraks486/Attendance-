import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, WorkLocation, AttendanceRecord } from '../types';

interface MapViewProps {
  userCoords: Coordinates | null;
  selectedLocation: WorkLocation | null;
  allLocations?: WorkLocation[];
  activeRecords?: AttendanceRecord[];
  isGeofenced?: boolean;
  distanceMeters?: number;
  height?: string;
  interactive?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  userCoords,
  selectedLocation,
  allLocations = [],
  activeRecords = [],
  isGeofenced,
  distanceMeters,
  height = '350px',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center (Bengaluru HQ or default coords)
    const initialLat = userCoords?.lat || selectedLocation?.lat || 13.0458;
    const initialLng = userCoords?.lng || selectedLocation?.lng || 77.6200;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!layerGroup) return;
    layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // 1. Draw Target Office Geofence Circle & Marker
    if (selectedLocation) {
      const officeLatLng: L.LatLngExpression = [selectedLocation.lat, selectedLocation.lng];
      bounds.push(officeLatLng);

      // Office Marker Icon
      const officeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 bg-slate-900 border-2 border-emerald-500 rounded-full shadow-lg text-emerald-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(officeLatLng, { icon: officeIcon })
        .bindPopup(`
          <div class="p-1 text-slate-800">
            <p class="font-bold text-sm">${selectedLocation.name}</p>
            <p class="text-xs text-slate-600">${selectedLocation.address}</p>
            <span class="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
              Geofence Radius: ${selectedLocation.radiusMeters}m
            </span>
          </div>
        `)
        .addTo(layerGroup);

      // Geofence Circle
      L.circle(officeLatLng, {
        radius: selectedLocation.radiusMeters,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(layerGroup);
    }

    // 2. Draw Other Work Locations if present
    allLocations.forEach((loc) => {
      if (selectedLocation && loc.id === selectedLocation.id) return;
      const latLng: L.LatLngExpression = [loc.lat, loc.lng];
      const icon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="flex items-center justify-center w-6 h-6 bg-slate-800 border border-slate-600 rounded-full shadow text-slate-300">
            <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(latLng, { icon })
        .bindPopup(`<b>${loc.name}</b><br/>${loc.address}`)
        .addTo(layerGroup);

      L.circle(latLng, {
        radius: loc.radiusMeters,
        color: '#64748b',
        fillColor: '#64748b',
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(layerGroup);
    });

    // 3. Draw User's Current GPS Location
    if (userCoords) {
      const userLatLng: L.LatLngExpression = [userCoords.lat, userCoords.lng];
      bounds.push(userLatLng);

      const isInside = isGeofenced !== undefined ? isGeofenced : true;
      const markerColor = isInside ? '#10b981' : '#f59e0b'; // Emerald or Amber

      const userIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-75" style="background-color: ${markerColor}"></span>
            <div class="relative flex items-center justify-center w-7 h-7 rounded-full text-slate-950 font-bold shadow-xl border-2 border-white" style="background-color: ${markerColor}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(userLatLng, { icon: userIcon })
        .bindPopup(`
          <div class="p-1 text-slate-800">
            <p class="font-bold text-xs">Your Live Location</p>
            <p class="text-[11px] text-slate-600">Lat: ${userCoords.lat.toFixed(5)}, Lng: ${userCoords.lng.toFixed(5)}</p>
            <p class="text-[11px] text-slate-500">Accuracy: &plusmn;${Math.round(userCoords.accuracy)}m</p>
            ${
              distanceMeters !== undefined
                ? `<div class="mt-1 font-semibold text-[11px] ${
                    isInside ? 'text-emerald-700' : 'text-amber-700'
                  }">${distanceMeters}m from ${selectedLocation?.name || 'Office'}</div>`
                : ''
            }
          </div>
        `)
        .addTo(layerGroup);

      // User Accuracy Circle
      if (userCoords.accuracy && userCoords.accuracy < 1000) {
        L.circle(userLatLng, {
          radius: userCoords.accuracy,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(layerGroup);
      }
    }

    // 4. Draw Active Team Members' Pins (For Manager View)
    activeRecords.forEach((rec) => {
      if (!rec.clockInCoords) return;
      const latLng: L.LatLngExpression = [rec.clockInCoords.lat, rec.clockInCoords.lng];
      bounds.push(latLng);

      const statusColor = rec.status === 'clocked_in' ? '#10b981' : rec.status === 'on_break' ? '#f59e0b' : '#64748b';

      const teamIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <img src="${rec.userAvatar}" class="w-8 h-8 rounded-full border-2 object-cover shadow-lg" style="border-color: ${statusColor}" />
            <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style="background-color: ${statusColor}"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(latLng, { icon: teamIcon })
        .bindPopup(`
          <div class="p-1 text-slate-800">
            <div class="flex items-center space-x-2">
              <img src="${rec.userAvatar}" class="w-6 h-6 rounded-full object-cover" />
              <div>
                <p class="font-bold text-xs">${rec.userName}</p>
                <p class="text-[10px] text-slate-500">${rec.jobTitle}</p>
              </div>
            </div>
            <div class="mt-2 text-[11px]">
              <span class="px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                rec.status === 'clocked_in'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }">
                ${rec.status.replace('_', ' ')}
              </span>
              <p class="mt-1 text-slate-600">Location: ${rec.clockInLocationName}</p>
            </div>
          </div>
        `)
        .addTo(layerGroup);
    });

    // Fit view bounds smoothly
    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }

    // Force map container resize recalculation
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [userCoords, selectedLocation, allLocations, activeRecords, isGeofenced, distanceMeters, interactive]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-2xs bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Geofence Compliance Badge Overlay */}
      {selectedLocation && distanceMeters !== undefined && (
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-2xs px-2.5 py-1 rounded border border-slate-200 shadow-xs flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isGeofenced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800">
              {isGeofenced ? 'In Work Zone' : 'Outside Geofence'}
            </span>
            <span className="text-slate-500 ml-1.5 font-mono text-[11px]">
              ({distanceMeters}m to {selectedLocation.name.split(' ')[0]})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
