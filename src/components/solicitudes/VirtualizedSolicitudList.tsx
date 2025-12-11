import { memo, useRef, useEffect, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SolicitudCard } from './SolicitudCard';

interface VirtualizedSolicitudListProps {
  solicitudes: any[];
  canViewGlobal: boolean;
  canExecuteActions: boolean;
  platziData: any[];
  sendingReminderId: string | null;
  approvingRequestId: string | null;
  sentReminders: Set<string>;
  lookingUpChamberId: string | null;
  onViewDetails: (solicitud: any) => void;
  onSendReminder: (solicitud: any) => void;
  onApproveRequest: (solicitud: any) => void;
  onEditRequest: (solicitud: any) => void;
  onLookupChamber: (solicitud: any) => void;
}

// Card height estimation - adjust based on your card design
const CARD_HEIGHT = 300;
const CARD_GAP = 24;
const ROW_HEIGHT = CARD_HEIGHT + CARD_GAP;

// Calculate columns based on container width
const getColumnCount = (width: number) => {
  if (width >= 1280) return 3; // xl
  if (width >= 768) return 2;  // md
  return 1;
};

export const VirtualizedSolicitudList = memo(function VirtualizedSolicitudList(props: VirtualizedSolicitudListProps) {
  const { 
    solicitudes, 
    canViewGlobal,
    canExecuteActions,
    platziData,
    sendingReminderId,
    approvingRequestId,
    sentReminders,
    lookingUpChamberId,
    onViewDetails,
    onSendReminder,
    onApproveRequest,
    onEditRequest,
    onLookupChamber,
  } = props;
  
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Pre-compute platzi data map for O(1) lookup
  const platziDataMap = useMemo(() => {
    const map = new Map<string, any>();
    platziData.forEach(p => {
      if (p.email) {
        map.set(p.email.toLowerCase(), p);
      }
    });
    return map;
  }, [platziData]);

  useEffect(() => {
    const updateWidth = () => {
      if (parentRef.current) {
        setContainerWidth(parentRef.current.offsetWidth);
      }
    };

    updateWidth();
    
    const resizeObserver = new ResizeObserver(updateWidth);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const columnCount = getColumnCount(containerWidth);
  const rowCount = Math.ceil(solicitudes.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  const virtualRows = virtualizer.getVirtualItems();

  if (containerWidth === 0) {
    return <div ref={parentRef} className="min-h-[400px] w-full" />;
  }

  return (
    <div className="w-full">
      <div
        ref={parentRef}
        className="w-full overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        style={{ height: 'calc(100vh - 400px)', minHeight: 400 }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => {
            const startIndex = virtualRow.index * columnCount;
            const items = solicitudes.slice(startIndex, startIndex + columnCount);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  }}
                >
                  {items.map((solicitud) => {
                    const emailLower = solicitud.email?.toLowerCase();
                    const personPlatziData = emailLower ? platziDataMap.get(emailLower) : null;
                    const hasConsumedLicense = !!personPlatziData;

                    return (
                      <SolicitudCard
                        key={solicitud.id}
                        solicitud={solicitud}
                        canViewGlobal={canViewGlobal}
                        canExecuteActions={canExecuteActions}
                        onViewDetails={() => onViewDetails(solicitud)}
                        onSendReminder={onSendReminder}
                        onApproveRequest={onApproveRequest}
                        onEditRequest={onEditRequest}
                        onLookupChamber={onLookupChamber}
                        isAdmin={canExecuteActions}
                        hasConsumedLicense={hasConsumedLicense}
                        personPlatziData={personPlatziData}
                        sendingReminder={sendingReminderId === solicitud.id}
                        approvingRequest={approvingRequestId === solicitud.id}
                        isSent={sentReminders.has(solicitud.id)}
                        lookingUpChamber={lookingUpChamberId === solicitud.id}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-2 py-2">
        Mostrando {Math.min(solicitudes.length, (virtualRows.length || 0) * columnCount)} de {solicitudes.length} solicitudes
      </div>
    </div>
  );
});
