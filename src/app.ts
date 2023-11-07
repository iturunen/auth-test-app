import express from 'express';
import { route, router } from 'typera-express';
import * as response from 'typera-express/response';
import { SetupLogger, Logger } from './middleware/Logger';
import { typeraVerifyTokenMiddleware } from './middleware/TokenVerificationMiddleware';
import { errorHandler } from './middleware/ErrorHandler';

const car_chargers = [
  {
    name: 'car-charger-basic',
    groups: ['gas_station_property'],
    serial_number: 'sn1',
    sim: '8961012345678901234',
    id: 321,
    connected: true,
    last_seen: 1697217789,
  },
  {
    name: 'car-charger-high-power',
    groups: ['rental_property_from_neste'],
    serial_number: 'sn2',
    sim: '9961012345678901233',
    id: 123,
    connected: false,
    last_seen: 1697217779,
  },
];

const app = express();

app.use(SetupLogger);

const chargerRoute = route
  .get('/charger_management/api/charger').use(typeraVerifyTokenMiddleware)
  .handler(async () => response.ok(car_chargers));

const healthCheckRoute = route
  .get('/charger_management/health')
  .handler(async () => response.ok({ health: 'OK' }));

// catch-all routing to index for bad requests
const notFoundRoute = route
  .get('/charger_management/*').use(typeraVerifyTokenMiddleware)
  .handler(async (req: { originalUrl: string; }) => response.notFound({ error: 'bad request', url: req.originalUrl }));

const apiRouter = router(
  chargerRoute,
  healthCheckRoute,
  notFoundRoute,
);

app.use(apiRouter.handler());
app.use(errorHandler);

const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
  Logger.info('Server started', `Listening on port ${port}`);
});
