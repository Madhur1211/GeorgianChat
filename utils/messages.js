// dependencies
const moment = require('moment-timezone');
const formatMessage = (username, text) => {
   return {
      username,
      text,
      time: new Date().toLocaleTimeString(),
   };
};

module.exports = formatMessage;


module.exports = formatMessage;
