/**
 * Google Maps for delivery addresses: script loading, GPS lookup, reverse
 * geocoding and address suggestions. Needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * with the Maps JavaScript, Geocoding and Places (New) APIs enabled; without
 * it only the browser's own location (no address text) is available.
 */

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
// advanced markers need a map id; Google's DEMO_MAP_ID works for development
export const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
export const mapsEnabled = KEY.length > 0;

/** Nairobi CBD — where the map opens when we know nothing better. */
export const DEFAULT_CENTER = { lat: -1.286389, lng: 36.817223 };

export interface LatLng {
    lat: number;
    lng: number;
}

/** A place turned into the fields our address form uses. */
export interface PickedPlace extends LatLng {
    line1: string;
    city: string;
    formatted: string;
}

let loading: Promise<void> | null = null;

export function loadMaps(): Promise<void> {
    if (!mapsEnabled) return Promise.reject(new Error("Maps aren't set up on this site."));
    if (typeof google !== "undefined" && typeof google.maps?.importLibrary === "function") return Promise.resolve();
    loading ??= new Promise<void>((resolve, reject) => {
        const callback = "__genesisMapsReady";
        (window as unknown as Record<string, () => void>)[callback] = () => resolve();
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&v=weekly&loading=async&region=KE&callback=${callback}`;
        script.async = true;
        script.onerror = () => {
            loading = null;
            reject(new Error("Couldn't load Google Maps. Check your connection."));
        };
        document.head.appendChild(script);
    });
    return loading;
}

/** The device's position (GPS / Wi-Fi). Works without a Maps key. */
export function currentPosition(): Promise<LatLng & { accuracy: number }> {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) return reject(new Error("This browser can't share your location."));
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
            (e) =>
                reject(new Error(
                    e.code === e.PERMISSION_DENIED
                        ? "Location is blocked. Allow location access for this site, or pin your spot on the map."
                        : "We couldn't find your location. Try again or pin it on the map.",
                )),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
        );
    });
}

type Component = { text: string; types: string[] };

/** Street-level first line and town from Google's address components. */
function toPlace(components: Component[], formatted: string, at: LatLng): PickedPlace {
    const get = (...types: string[]) => components.find((c) => types.some((t) => c.types.includes(t)))?.text;
    const street = [get("street_number"), get("route")].filter(Boolean).join(" ");
    const building = get("premise", "establishment", "point_of_interest");
    const area = get("neighborhood", "sublocality_level_1", "sublocality");
    const city = (get("locality", "postal_town") ?? get("administrative_area_level_2", "administrative_area_level_1") ?? "")
        .replace(/ County$/i, "")
        .replace(/ City$/i, "");
    const line1 = [building, street, area !== city ? area : undefined].filter(Boolean).join(", ")
        || formatted.split(",")[0]?.trim()
        || "";
    return { ...at, line1, city, formatted };
}

/** Address at a point on the map. */
export async function reverseGeocode(at: LatLng): Promise<PickedPlace> {
    await loadMaps();
    const { Geocoder } = (await google.maps.importLibrary("geocoding")) as google.maps.GeocodingLibrary;
    const { results } = await new Geocoder().geocode({ location: at });
    const best = results[0];
    if (!best) return { ...at, line1: "", city: "", formatted: "" };
    return toPlace(
        best.address_components.map((c) => ({ text: c.long_name, types: c.types })),
        best.formatted_address,
        at,
    );
}

export interface Suggestion {
    id: string;
    main: string;
    secondary: string;
    prediction: google.maps.places.PlacePrediction;
}

/** Kenyan address / place suggestions for what the shopper is typing. */
export async function suggestPlaces(input: string, sessionToken: google.maps.places.AutocompleteSessionToken, near?: LatLng | null): Promise<Suggestion[]> {
    await loadMaps();
    const { AutocompleteSuggestion } = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken,
        includedRegionCodes: ["ke"],
        ...(near ? { origin: near, locationBias: { center: near, radius: 30000 } } : {}),
    });
    return suggestions
        .map((s) => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => !!p)
        .map((p) => ({
            id: p.placeId,
            main: p.mainText?.text ?? p.text.text,
            secondary: p.secondaryText?.text ?? "",
            prediction: p,
        }));
}

export async function newSessionToken() {
    await loadMaps();
    const { AutocompleteSessionToken } = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
    return new AutocompleteSessionToken();
}

/** Full address + coordinates for a chosen suggestion (ends the autocomplete session). */
export async function placeDetails(s: Suggestion): Promise<PickedPlace> {
    const place = s.prediction.toPlace();
    await place.fetchFields({ fields: ["location", "addressComponents", "formattedAddress", "displayName"] });
    const at = { lat: place.location?.lat() ?? DEFAULT_CENTER.lat, lng: place.location?.lng() ?? DEFAULT_CENTER.lng };
    const picked = toPlace(
        (place.addressComponents ?? []).map((c) => ({ text: c.longText ?? "", types: c.types })),
        place.formattedAddress ?? "",
        at,
    );
    // a named place ("Yaya Centre") is a better first line than the street it's on
    const name = place.displayName && !picked.line1.includes(place.displayName) ? place.displayName : null;
    return name ? { ...picked, line1: [name, picked.line1].filter(Boolean).join(", ") } : picked;
}

export const mapsLink = (at: LatLng) => `https://www.google.com/maps/search/?api=1&query=${at.lat},${at.lng}`;
