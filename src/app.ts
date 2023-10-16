import express, {Request, Response } from 'express';;
import { setupExpressLogger, Logger } from './service/Logger';
import { verifyTokenMiddleware } from './middleware/TokenVerificationMiddleware';


const app = express();

app.use(setupExpressLogger);
app.use(verifyTokenMiddleware);
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

app.get(
  '/charger_management/api/charger',
  (request: Request, response: Response) => {
    response.json(car_chargers);
  }
);

app.get('/charger_management/health', (req: Request, resp: Response) => {
  resp.json({ health: 'OK' });
});

// catch-all routing to index for bad requests
app.get('/charger_management/*', (req, res) => {
  res.status(404).json({ error: 'bad request', url: req.url, status: 404 });
});

((port = process.env.APP_PORT || 3000) => {
  app.listen(port, () => Logger.info(`Server started`, `Listening: ${port}`));
})();
