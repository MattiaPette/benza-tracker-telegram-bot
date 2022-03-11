export const incomingWebhookHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ text: 'Hello World!' }),
  };
};
