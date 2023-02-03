const express = require('express');
const AppError = require('./utils/apperror');
const authen = require('./routes/auth');
const profi = require('./routes/profile');
const globalErrorHandler = require('./contollers/errorhandler');
const app = express();
const morgan = require('morgan');
require('dotenv').config();
require('./utils/db').connect();
app.use(morgan('dev'));
app.use(express.json());
app.use('/v1/api/user', authen);
app.use('/v1/api/userprofile', profi);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
app.use(express.urlencoded({ extended: false }));
// app.use('/api', router);
app.listen(process.env.PORT, () => console.log(`Server Connected to port ${process.env.PORT}`))