/**
 * Centralized Map Tile Configuration for Admin Web
 * Ensures CARTO API key is consistently attached across all maps
 * with standard OpenStreetMap fallback.
 */

export const getCartoKey = () => {
  return (
    import.meta.env.VITE_CARTO_API_KEY ||
    localStorage.getItem('carto-api-key') ||
    'cb1_481f_1_8f54dbe0d9a39f053f457e83'
  );
};

export const getTileUrl = (theme = 'voyager') => {
  const key = getCartoKey();
  if (key) {
    if (theme === 'dark') {
      return `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${key}`;
    }
    if (theme === 'light') {
      return `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${key}`;
    }
    return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${key}`;
  }
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
};

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

export const MAP_SUBDOMAINS = ['a', 'b', 'c', 'd'];
