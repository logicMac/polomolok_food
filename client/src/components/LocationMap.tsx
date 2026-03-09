import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
}

const LocationMap = ({ latitude, longitude, address }: LocationMapProps) => {
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-zinc-800">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          {address && (
            <Popup>
              <div className="text-sm">
                <strong>Delivery Location</strong>
                <br />
                {address}
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
