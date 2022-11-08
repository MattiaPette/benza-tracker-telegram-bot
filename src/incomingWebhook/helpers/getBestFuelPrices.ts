import fetch from 'node-fetch';

import { FuelStation } from './findBestFuelPrice';

import { Geo } from './getLocationGeo';

import { findBestFuelPrice } from './findBestFuelPrice';

export type GetBestFuelPricesFactoryConfiguration = {
  readonly baseUrl: string;
};

export type GetBestFuelPrices = (
  location: Geo,
  fuel: string,
) => Promise<FuelStation | null>;

export type GetBestFuelPricesFactory = (
  config: GetBestFuelPricesFactoryConfiguration,
) => GetBestFuelPrices;

export type FuelSearchResponse = {
  readonly success: boolean;
  readonly center: {
    readonly first: number;
    readonly second: number;
  };
  readonly priceSort: boolean;
  readonly results: readonly FuelStation[];
};

export const createGetBestFuelPrices: GetBestFuelPricesFactory =
  ({ baseUrl }) =>
  async ({ lat, lng }, fuel) => {
    try {
      const params = {
        points: [
          {
            lat,
            lng,
          },
        ],
        priceOrder: 'asc',
        fuelType: fuel,
      };

      console.log(params);

      const data = await fetch(`${baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(data.status);
      console.log(data.statusText);

      const parsedData = (await data.json()) as FuelSearchResponse;

      console.log(JSON.stringify(parsedData));

      return findBestFuelPrice(parsedData.results);
    } catch (error) {
      return null;
    }
  };
