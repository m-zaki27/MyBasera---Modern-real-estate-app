/**
 * Builds a self-contained Leaflet + OpenStreetMap page for a WebView (native) or iframe (web).
 * Taps are posted back to the host as JSON: { mapId, type: 'marker', id } | { mapId, type: 'map' }.
 *
 * OpenStreetMap's tile servers are free but run on donations, and their usage policy
 * (https://operations.osmfoundation.org/policies/tiles/) asks apps to show attribution,
 * identify themselves (we set the WebView user agent), and avoid heavy traffic. For a
 * high-traffic production app, switch TILE_URL to a commercial OSM tile provider.
 */

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  /** Short text inside the pin, e.g. a compact price. Omit for a plain dot pin. */
  label?: string;
};

export type LeafletPageOptions = {
  mapId: string;
  markers: MapMarker[];
  interactive: boolean;
  dark: boolean;
  /** Zoom used when there's a single marker. */
  singleMarkerZoom?: number;
};

export type LeafletMessage =
  | { mapId: string; type: 'marker'; id: string }
  | { mapId: string; type: 'map' };

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
// Subresource integrity for the pinned Leaflet build (verified against unpkg).
const LEAFLET_CSS_SRI = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
const LEAFLET_JS_SRI = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

// Pakistan, shown when there's nothing to frame.
const DEFAULT_CENTER = [30.3753, 69.3451];
const DEFAULT_ZOOM = 5;

/** JSON that's safe to inline inside a <script> tag. */
function inlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function buildLeafletPage({
  mapId,
  markers,
  interactive,
  dark,
  singleMarkerZoom = 15,
}: LeafletPageOptions): string {
  const config = {
    mapId,
    markers: markers.map((marker) => ({
      id: marker.id,
      lat: marker.latitude,
      lng: marker.longitude,
      label: marker.label ?? null,
    })),
    interactive,
    singleMarkerZoom,
    defaultCenter: DEFAULT_CENTER,
    defaultZoom: DEFAULT_ZOOM,
    tileUrl: TILE_URL,
  };

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${LEAFLET_CSS}" integrity="${LEAFLET_CSS_SRI}" crossorigin="" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: ${dark ? '#0A0A0A' : '#F5F7FA'}; }
  ${dark ? '.leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9); }' : ''}
  .pin {
    transform: translate(-50%, -100%);
    white-space: nowrap;
    padding: 4px 9px;
    border-radius: 999px;
    font: 700 12px -apple-system, system-ui, Roboto, sans-serif;
    background: #FFFFFF;
    color: #0A0A0A;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  }
  .pin.selected { background: #C2472B; color: #FFFFFF; border-color: #C2472B; }
  .dot {
    transform: translate(-50%, -50%);
    width: 18px; height: 18px; border-radius: 50%;
    background: #C2472B; border: 3px solid #FFFFFF;
    box-shadow: 0 1px 4px rgba(0,0,0,0.35);
  }
  .leaflet-div-icon { background: transparent; border: none; }
  .leaflet-control-attribution { font-size: 10px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="${LEAFLET_JS}" integrity="${LEAFLET_JS_SRI}" crossorigin=""></script>
<script>
(function () {
  var config = ${inlineJson(config)};
  function post(message) {
    message.mapId = config.mapId;
    var text = JSON.stringify(message);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(text);
    else if (window.parent !== window) window.parent.postMessage(text, '*');
  }

  var map = L.map('map', {
    zoomControl: config.interactive,
    dragging: config.interactive,
    touchZoom: config.interactive,
    scrollWheelZoom: config.interactive,
    doubleClickZoom: config.interactive,
    boxZoom: config.interactive,
    keyboard: config.interactive,
    tap: config.interactive,
  });
  L.tileLayer(config.tileUrl, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Leaflet only creates marker DOM elements once the map has a view, so labels go into
  // the icon HTML and elements are looked up lazily when selecting.
  var leafletMarkers = {};
  function select(id) {
    Object.keys(leafletMarkers).forEach(function (key) {
      var element = leafletMarkers[key].getElement();
      var pin = element && element.querySelector('.pin');
      if (pin) pin.classList.toggle('selected', key === id);
    });
  }

  var points = [];
  config.markers.forEach(function (marker) {
    var html = marker.label
      ? '<div class="pin">' + escapeHtml(marker.label) + '</div>'
      : '<div class="dot"></div>';
    var leafletMarker = L.marker([marker.lat, marker.lng], {
      icon: L.divIcon({ html: html, className: '', iconSize: null }),
      keyboard: false,
    }).addTo(map);
    leafletMarkers[marker.id] = leafletMarker;
    leafletMarker.on('click', function (event) {
      L.DomEvent.stopPropagation(event);
      select(marker.id);
      post({ type: 'marker', id: marker.id });
    });
    points.push([marker.lat, marker.lng]);
  });

  map.on('click', function () {
    select(null);
    post({ type: 'map' });
  });

  // Frame the pins only once the container has a real size: fitting a 0×0 map divides by
  // zero (NaN zoom) and Leaflet never finishes loading. Hosts can lay out after the page runs.
  function frame() {
    if (map.getContainer().clientHeight === 0 || map.getContainer().clientWidth === 0) {
      setTimeout(frame, 100);
      return;
    }
    map.invalidateSize();
    if (points.length === 1) map.setView(points[0], config.singleMarkerZoom);
    else if (points.length > 1) map.fitBounds(points, { padding: [48, 48], maxZoom: 15 });
    else map.setView(config.defaultCenter, config.defaultZoom);
  }
  frame();
  window.addEventListener('resize', function () { map.invalidateSize(); });
})();
</script>
</body>
</html>`;
}

export function parseLeafletMessage(raw: string, mapId: string): LeafletMessage | null {
  try {
    const message = JSON.parse(raw) as LeafletMessage;
    return message.mapId === mapId ? message : null;
  } catch {
    return null;
  }
}
