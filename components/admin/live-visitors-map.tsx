'use client';

import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip } from '@/components/ui/map';
import { MapPin } from 'lucide-react';

type LiveVisitor = { sessionId: string; city: string; region: string; country: string; latitude: number | null; longitude: number | null; sourcePlatform: string; path: string };

export function LiveVisitorsMap({ visitors }: { visitors: LiveVisitor[] }) {
  const located = visitors.filter((visitor) => visitor.latitude !== null && visitor.longitude !== null);
  return (
    <div className="analytics-map">
      <Map center={[-51.5, -14.2]} zoom={3.1} theme="dark">
        <MapControls position="top-right" showZoom />
        {located.map((visitor) => (
          <MapMarker key={visitor.sessionId} longitude={visitor.longitude!} latitude={visitor.latitude!}>
            <MarkerContent className="analytics-map-marker"><MapPin aria-hidden="true" /></MarkerContent>
            <MarkerTooltip><strong>{visitor.city}</strong><span>{visitor.sourcePlatform} · {visitor.path}</span></MarkerTooltip>
          </MapMarker>
        ))}
      </Map>
      {!located.length && <div className="analytics-map-empty"><MapPin /><strong>Aguardando acesso com localização disponível</strong><span>Os próximos visitantes ativos aparecerão aqui.</span></div>}
      <div className="analytics-map-summary"><strong>{visitors.length}</strong><span>{visitors.length === 1 ? 'pessoa vendo agora' : 'pessoas vendo agora'}</span></div>
    </div>
  );
}
