const express = require('express');
const bodyparser = require('body-parser');
const app = express();

app.use(express.static(__dirname));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}))

var server = app.listen(3000, () => {
    console.log("server is listening on port", server.address().port);
});



// console.log() console.log()

