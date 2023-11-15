import { Logger } from './middleware/Logger';
import { createApp } from './app';

export const initializeServer = () => {
  const app = createApp();
  const port = process.env.APP_PORT || 3000;
  const server = app.listen(port, () => {
    Logger.info('Test Server started', `Listening on port ${port}`);
  });
  return server;
};

