require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./models');
const bodyParser = require('body-parser');

app.use(express.json());

require('./routes/routes')(app);

// db.sequelize.sync({ force: true });
db.sequelize.sync();

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
