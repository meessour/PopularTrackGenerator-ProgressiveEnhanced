const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var server = app.listen(3000, () => {
    console.log("Server is listening on port", server.address().port);
});