"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
;
const Logger_1 = require("./service/Logger");
const TokenVerificationMiddleware_1 = require("./middleware/TokenVerificationMiddleware");
const app = (0, express_1.default)();
app.use(Logger_1.SetupLogger);
app.use(TokenVerificationMiddleware_1.verifyTokenMiddleware);
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
app.get('/charger_management/api/charger', (request, response) => {
    response.json(car_chargers);
});
app.get('/charger_management/health', (req, resp) => {
    resp.json({ health: 'OK' });
});
// catch-all routing to index for bad requests
app.get('/charger_management/*', (req, res) => {
    res.status(404).json({ error: 'bad request', url: req.url, status: 404 });
});
// Error handler must be defined last
//app.use(errorHandler);
((port = process.env.APP_PORT || 3000) => {
    app.listen(port, () => Logger_1.Logger.info(`Server started`, `Listening: ${port}`));
})();
//# sourceMappingURL=app.js.map