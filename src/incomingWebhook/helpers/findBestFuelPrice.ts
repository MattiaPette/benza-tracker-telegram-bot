import { Geo } from './getLocationGeo';

export type Fuel = {
  readonly id: number;
  readonly fuelId: number;
  readonly isSelf: boolean;
  readonly name: string;
  readonly price: number;
};

export type FuelStation = {
  readonly fuels: readonly Fuel[];
  readonly insertDate: string; // date format: 2021-12-10T17:21:03+01:00
  readonly location: Geo;
  readonly address: string;
  readonly brand: string;
  readonly name: string;
  readonly id: number;
};

/*
  The API should be already sorted by price so we can filter the list by
  removing the stations that are not updated in the last 24 hours and take the
  first item of the array.
*/
export const findBestFuelPrice = (
  stations: readonly FuelStation[],
): FuelStation =>
  stations.filter(
    ({ insertDate }) =>
      new Date(insertDate).getTime() > new Date().getTime() - 86400000,
  )[0];
