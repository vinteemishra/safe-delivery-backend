'use strict';
import config from './index';
import winston from 'winston';

const log = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      timestamp: true,
      colorize: config.env === 'dev'
    })
  ],
  exitOnError: true
});

export default log;
