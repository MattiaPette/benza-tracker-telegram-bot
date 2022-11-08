import geoJson from '../assets/geoComuni.json';

export type Geo = {
  readonly lat: string;
  readonly lng: string;
};

const parseLocationString = (location: string): string =>
  location.replace(/[^a-zA-Z]/gi, '').toLowerCase();

export const getLocationGeo = (location: string): Geo | undefined => {
  const comune = geoJson.find(
    ({ comune }) =>
      parseLocationString(comune) === parseLocationString(location),
  );

  return (
    comune && {
      lat: comune?.lat,
      lng: comune?.lng,
    }
  );
};
