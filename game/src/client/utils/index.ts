export const Delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const isPedFreemodeModel = (ped: number): boolean => {
  const entityModel = GetEntityModel(ped);

  const freemodeMale = GetHashKey('mp_m_freemode_01');
  const freemodeFemale = GetHashKey('mp_f_freemode_01');

  return entityModel === freemodeMale || entityModel === freemodeFemale;
};

export function arrayToVector3(coords: number[]): Vector3 {
  return {
    x: coords[0],
    y: coords[1],
    z: coords[2],
  };
}

export function distance(coords, tocoords): number {
  if (Array.isArray(tocoords)) {
    tocoords = arrayToVector3(tocoords);
  }
  coords = arrayToVector3(coords);
  return Math.hypot(coords.x - tocoords.x, coords.y - tocoords.y);
}
