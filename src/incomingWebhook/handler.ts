import { APIGatewayEvent, Context } from 'aws-lambda';
import type { Update } from 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';
import { getLocationGeo } from './helpers/getLocationGeo';
import { createGetBestFuelPrices } from './helpers/getBestFuelPrices';

const {
  env: { TELEGRAM_BOT_TOKEN, FUEL_API_BASE_URL },
} = process;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

const getBestFuelPrices = createGetBestFuelPrices({
  baseUrl: FUEL_API_BASE_URL,
});

const commandFuelMap: Record<string, string> = {
  '/benzina': '1-x',
  '/diesel': '2-x',
  '/metano': '3-x',
  '/gpl': '4-x',
};

export const incomingWebhookHandler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { body } = event;

  if (!body) {
    return { statusCode: 200 };
  }

  try {
    const { message } = JSON.parse(body) as Update;

    if (!message || !message.text) {
      return { statusCode: 200 };
    }

    const [command, ...location] = message.text.split(' ');

    if (!command) {
      return { statusCode: 200 };
    }

    console.log(command);
    console.log(command.split('@')[0]);

    const selectedFuel = commandFuelMap[command.split('@')[0]];

    if (!selectedFuel) {
      await bot.sendMessage(
        message.chat.id,
        'Inserisci il comando corretto dalla lista per eseguire la ricerca.',
      );
      return { statusCode: 200 };
    }

    if (!location) {
      await bot.sendMessage(
        message.chat.id,
        'Inserisci il comune per eseguire la ricerca.',
      );
      return { statusCode: 200 };
    }

    await bot.sendChatAction(message.chat.id, 'find_location');

    const locationCoordinates = getLocationGeo(location.join(''));

    if (!locationCoordinates) {
      await bot.sendMessage(message.chat.id, 'Comune non trovato.');
      return { statusCode: 200 };
    }

    const bestPrice = await getBestFuelPrices(
      locationCoordinates,
      selectedFuel,
    );

    if (!bestPrice) {
      await bot.sendMessage(
        message.chat.id,
        'Le stazioni di rifornimento nei tuoi dintorni non hanno aggiornato i loro dati nelle ultime 24h o il servizio è temporaneamente non disponibile.',
      );
      return { statusCode: 200 };
    }

    const { brand, name, fuels, address, insertDate } = bestPrice;

    const availableFuel = fuels
      .map(
        ({ name, price, isSelf }) =>
          `${name} (${isSelf ? 'Self Sevice' : 'Servito'}): ${price}`,
      )
      .join(' - ');

    // TODO: find a better way :) it's 2am and I'm tired
    const formattedBestPriceMessage = `La stazione di rifornimento più conveniente vicina a te è ${brand} - ${name}.
Carburanti disponibili:
${availableFuel}
Dati aggiornati al: ${new Date(insertDate).toLocaleDateString()} ${new Date(
      insertDate,
    ).toLocaleTimeString()}
[Link Google Maps](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}).`;

    await bot.sendMessage(message.chat.id, formattedBestPriceMessage, {
      parse_mode: 'Markdown',
    });

    return { statusCode: 200 };
  } catch (error) {
    console.log(error);
    return { statusCode: 200 };
  }
};
