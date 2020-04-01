const http = require('http');
const fs = require('fs');
const enforce = require('express-sslify');
const express = require('express');
const bodyparser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

// Enforce https when on Heroku
if (app.get("env") === "production") {
    app.use(enforce.HTTPS({trustProtoHeader: true}));
}

const port = process.env.PORT || 8000;

http.createServer(app).listen(port, () => {
    console.log("Server is listening on port", port);
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});
app.get('/login', (req, res) => {
    res.render('login.ejs');
});
app.post('/login', (req, res) => {
    const requestBody = req.body;
    const pin = requestBody.pin

    doesPinExist(pin).then(function (pinExists) {
        if (pinExists) {
            navigateToWhatPage(pin).then(function (page) {
                if (page) {
                    res.redirect(`/${page}/${pin}`);
                } else {
                    res.redirect(`/`);
                }
            });
        } else {
            res.redirect('/');
        }
    });
});
app.get('/new_user', (req, res) => {
    console.log("new user");
    const newPin = Math.floor(100000 + Math.random() * 900000);

    saveAnswer(newPin, undefined, undefined).then(function (success) {
        if (success) {
            res.redirect(`/new_user/${newPin}`);
        } else {
            console.log("new user FOUT");

            res.redirect(`/`);
        }
    });

});
app.get('/new_user/:pin', (req, res) => {
    const pin = req.params.pin
    console.log("new user", pin);

    res.render('new_user.ejs', {pin: pin});
});
app.get('/finished/:pin', (req, res) => {
    const pin = req.params.pin
    console.log("new user", pin);
    navigateToWhatPage(pin).then(function (page) {
        if (page === "finished") {
            res.render('finished.ejs');
        } else {
            res.redirect(`/${page}/${pin}`);
        }
    });

});
app.get('/question1/:pin', (req, res) => {
    const pin = req.params.pin
    doesPinExist(pin).then(function (pinExists) {
        if (pinExists) {
            getAnswerFromQuestion(pin, "question1").then(function (answers) {
                let name = ""
                let age = ""

                if (answers && answers.name)
                    name = answers.name;

                if (answers && answers.age)
                    age = answers.age;

                console.log("resulst quesiotn 1", answers)

                res.render('question1.ejs', {name: name, age: age});
            });
        } else {
            res.redirect('/');
        }
    });
});
app.get('/question2/:pin', (req, res) => {
    const pin = req.params.pin
    doesPinExist(pin).then(function (pinExists) {
        if (pinExists) {
            getAnswerFromQuestion(pin, "question2").then(function (answers) {
                let checked1 = ""
                let checked2 = ""
                let checked3 = ""
                let checked4 = ""

                if (answers && answers.subject === "Web app from scratch") {
                    checked1 = "checked";
                } else if (answers && answers.subject === "CSS to the rescue") {
                    checked2 = "checked";
                } else if (answers && answers.subject === "Progressive web apps") {
                    checked3 = "checked";
                } else if (answers && answers.subject === "Browser technologies") {
                    checked4 = "checked";
                }

                res.render('question2.ejs', {
                    checked1: checked1,
                    checked2: checked2,
                    checked3: checked3,
                    checked4: checked4
                });
            });
        } else {
            res.redirect('/');
        }
    });
});
app.get('/question3/:pin', (req, res) => {
    const pin = req.params.pin
    doesPinExist(pin).then(function (pinExists) {
        if (pinExists) {
            getAnswerFromQuestion(pin, "question3").then(function (answers) {
                let mostUsefull = ""

                if (answers && answers.mostUsefull)
                    mostUsefull = answers.mostUsefull;

                res.render('question3.ejs', {mostUsefull: mostUsefull});
            });
        } else {
            res.redirect('/');
        }
    });
});
app.get('/question4/:pin', (req, res) => {
    const pin = req.params.pin
    doesPinExist(pin).then(function (pinExists) {
        if (pinExists) {
            getAnswerFromQuestion(pin, "question4").then(function (answers) {
                let checked1 = ""
                let checked2 = ""
                let checked3 = ""
                let checked4 = ""

                console.log("option:", answers.selectedOptions)

                if (answers && answers.selectedOptions && answers.selectedOptions.includes("1")) {
                    checked1 = "checked";
                }
                if (answers && answers.selectedOptions && answers.selectedOptions.includes("2")) {
                    checked2 = "checked";
                }
                if (answers && answers.selectedOptions && answers.selectedOptions.includes("3")) {
                    checked3 = "checked";
                }
                if (answers && answers.selectedOptions && answers.selectedOptions.includes("4")) {
                    checked4 = "checked";
                }

                res.render('question4.ejs', {
                    checked1: checked1,
                    checked2: checked2,
                    checked3: checked3,
                    checked4: checked4
                });
            });
        } else {
            res.redirect('/');
        }
    });
});
app.get('/question5/:pin', (req, res) => {
    const pin = req.params.pin;
    doesPinExist(pin).then(function (pinExists) {
        if (pinExists) {
            getAnswerFromQuestion(pin, "question5").then(function (answers) {
                let grade = "0";

                if (answers && answers.grade)
                    grade = answers.grade;

                res.render('question5.ejs', {grade: grade});
            });
        } else {
            res.redirect('/');
        }
    });
});

app.post('/question1', (req, res) => {
    try {
        const previousPage = "";
        const currentPage = "question1";
        const nextPage = "question2";

        const requestBody = req.body;

        const pin = getPin(req);

        const navigate = req.body.navigate;
        if (navigate === "previous") {
            res.redirect(`/${previousPage}/${pin}`);
        } else {
            res.redirect(`/${nextPage}/${pin}`);
        }

        doesPinExist(pin).then(function (pinExists) {
            if (!pinExists) {
                res.redirect('/');
            } else {
                const firstName = requestBody.firstname;
                const age = requestBody.age

                if (firstName && firstName.trim().length && age && age.trim().length) {
                    const answer = {
                        name: firstName,
                        age: age
                    };

                    saveAnswer(pin, currentPage, answer).then(function (success) {
                        if (success) {
                            if (navigate === "previous") {
                                res.redirect(`/${previousPage}/${pin}`);
                            } else {
                                res.redirect(`/${nextPage}/${pin}`);
                            }
                        } else {
                            console.log("new user FOUT");
                            res.redirect(`/`);
                        }
                    });
                } else {
                    if (navigate === "previous") {
                        res.redirect(`/${previousPage}/${pin}`);
                    } else {
                        res.redirect(`/${nextPage}/${pin}`);
                    }
                }
            }
        });
    } catch (err) {
        console.log("something went wrong", req.path)
        res.redirect('/');
    }
});
app.post('/question2', (req, res) => {
    try {
        const previousPage = "question1"
        const currentPage = "question2"
        const nextPage = "question3"

        const requestBody = req.body;

        const pin = getPin(req);
        const navigate = requestBody.navigate

        console.log("navigate?", navigate)

        doesPinExist(pin).then(function (pinExists) {
            if (!pinExists) {
                res.redirect('/');
            } else {
                const subject = requestBody.subject;

                console.log("subject", subject)

                if (subject && subject.trim().length) {
                    const answer = {
                        subject: subject
                    };

                    saveAnswer(pin, currentPage, answer).then(function (success) {
                        if (success) {
                            if (navigate === "previous") {
                                res.redirect(`/${previousPage}/${pin}`);
                            } else {
                                res.redirect(`/${nextPage}/${pin}`);
                            }
                        } else {
                            console.log("new user FOUT");
                            res.redirect(`/`);
                        }
                    });
                    res.redirect(`/${nextPage}/${pin}`);
                } else {
                    if (navigate === "previous") {
                        res.redirect(`/${previousPage}/${pin}`);
                    } else {
                        res.redirect(`/${nextPage}/${pin}`);
                    }
                }
            }
        });
    } catch (err) {
        console.log("something went wrong", req.path)
        res.redirect('/');
    }
});
app.post('/question3', (req, res) => {
    try {
        const previousPage = "question2"
        const currentPage = "question3"
        const nextPage = "question4"

        const requestBody = req.body;

        const pin = getPin(req);
        const navigate = requestBody.navigate

        doesPinExist(pin).then(function (pinExists) {
            if (!pinExists) {
                res.redirect('/');
            } else {
                const mostUsefull = requestBody.mostUsefull;

                console.log("mostUsefull", mostUsefull)

                if (mostUsefull && mostUsefull.trim().length) {
                    const answer = {
                        mostUsefull: mostUsefull
                    };

                    saveAnswer(pin, currentPage, answer).then(function (success) {
                        if (success) {
                            if (navigate === "previous") {
                                res.redirect(`/${previousPage}/${pin}`);
                            } else {
                                res.redirect(`/${nextPage}/${pin}`);
                            }
                        } else {
                            console.log("new user FOUT");
                            res.redirect(`/`);
                        }
                    });
                    res.redirect(`/${nextPage}/${pin}`);
                } else {
                    if (navigate === "previous") {
                        res.redirect(`/${previousPage}/${pin}`);
                    } else {
                        res.redirect(`/${nextPage}/${pin}`);
                    }
                }
            }
        });
    } catch (err) {
        console.log("something went wrong", req.path)
        res.redirect('/');
    }
});
app.post('/question4', (req, res) => {
    try {
        const previousPage = "question3"
        const currentPage = "question4"
        const nextPage = "question5"

        const requestBody = req.body;

        const pin = getPin(req);
        const navigate = requestBody.navigate

        doesPinExist(pin).then(function (pinExists) {
            if (!pinExists) {
                res.redirect('/');
            } else {
                let selectedOptions = requestBody.answer;

                if (selectedOptions && selectedOptions.length) {

                    if (!Array.isArray(selectedOptions))
                        selectedOptions = [selectedOptions];

                    console.log("selectedOptions", selectedOptions)

                    const answer = {
                        selectedOptions: selectedOptions
                    };

                    saveAnswer(pin, currentPage, answer).then(function (success) {
                        if (success) {
                            if (navigate === "previous") {
                                res.redirect(`/${previousPage}/${pin}`);
                            } else {
                                res.redirect(`/${nextPage}/${pin}`);
                            }
                        } else {
                            console.log("new user FOUT");
                            res.redirect(`/`);
                        }
                    });
                    res.redirect(`/${nextPage}/${pin}`);
                } else {
                    if (navigate === "previous") {
                        res.redirect(`/${previousPage}/${pin}`);
                    } else {
                        res.redirect(`/${nextPage}/${pin}`);
                    }
                }
            }
        });
    } catch (err) {
        console.log("something went wrong", req.path)
        res.redirect('/');
    }
});
app.post('/question5', (req, res) => {
    try {
        const previousPage = "question4"
        const currentPage = "question5"
        const nextPage = "finished"

        const requestBody = req.body;

        const pin = getPin(req);
        const navigate = requestBody.navigate

        doesPinExist(pin).then(function (pinExists) {
            if (!pinExists) {
                res.redirect('/');
            } else {
                const grade = requestBody.grade;

                console.log("grade", requestBody)

                if (grade > 0) {
                    const answer = {
                        grade: grade
                    };

                    saveAnswer(pin, currentPage, answer).then(function (success) {
                        if (success) {
                            if (navigate === "previous") {
                                res.redirect(`/${previousPage}/${pin}`);
                            } else {
                                res.redirect(`/${nextPage}/${pin}`);
                            }
                        } else {
                            console.log("new user FOUT");
                            res.redirect(`/`);
                        }
                    });
                    res.redirect(`/${nextPage}/${pin}`);
                } else {
                    if (navigate === "previous") {
                        res.redirect(`/${previousPage}/${pin}`);
                    } else {
                        res.redirect(`/${nextPage}/${pin}`);
                    }
                }
            }
        });
    } catch (err) {
        console.log("something went wrong", req.path)
        res.redirect('/');
    }
});

function getPin(req) {
    let requestSegments = req.headers.referer.split('/');
    let pin = requestSegments[requestSegments.length - 1];

    console.log("pin", pin)

    return pin
}

async function doesPinExist(pin) {
    pin = pin.toString()
    return new Promise(function (resolve, reject) {
        fs.readFile('answers.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                var obj = JSON.parse(data); //now it an object

                for (let i = 0; i < obj.answers.length; i++) {
                    if (obj.answers[i] && obj.answers[i].pin === pin) {
                        console.log("Pin exists!")

                        resolve(true)
                        return;
                    }
                }
                console.log("Pin does not exist")
                resolve(false)
                return;
            }
        });
    });
}

async function saveAnswer(pin, question, answer) {
    console.log("saveAnswer called!")
    pin = pin.toString()
    return new Promise(function (resolve, reject) {
        fs.readFile('answers.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
                return;
            } else {
                var obj = JSON.parse(data); //now it an object
                console.log("obj before:", obj);

                doesPinExist(pin).then(function (pinExists) {
                    if (pinExists) {
                        console.log("saveAnswer called! iwht pin existy")
                        for (let i = 0; i < obj.answers.length; i++) {
                            console.log("obj.answers[i].pin", obj.answers[i].pin, pin)
                            if (obj.answers[i] && obj.answers[i].pin === pin) {
                                console.log("Yes, match!")
                                console.log("###########")
                                if (question === "question1") {
                                    obj.answers[i].question1 = answer;
                                } else if (question === "question2") {
                                    obj.answers[i].question2 = answer;
                                } else if (question === "question3") {
                                    obj.answers[i].question3 = answer;
                                } else if (question === "question4") {
                                    obj.answers[i].question4 = answer;
                                } else if (question === "question5") {
                                    obj.answers[i].question5 = answer;
                                }
                                console.log("obj after!", obj)
                                console.log("obj after!", obj.answers[i])
                                var json = JSON.stringify(obj); //convert it back to json
                                fs.writeFile('answers.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                        resolve(false)
                                        return;
                                    }
                                    console.log("The file was saved!");
                                    resolve(true)
                                    return;
                                });
                            }
                        }
                    } else {
                        console.log("saveAnswer called! no pin yet")

                        obj.answers.push({pin: pin}); //add some data

                        if (question === "question1") {
                            obj.answers[obj.answers.length - 1].question1 = answer;
                        } else if (question === "question2") {
                            obj.answers[obj.answers.length - 1].question2 = answer;
                        } else if (question === "question3") {
                            obj.answers[obj.answers.length - 1].question3 = answer;
                        } else if (question === "question4") {
                            obj.answers[obj.answers.length - 1].question4 = answer;
                        } else if (question === "question5") {
                            obj.answers[obj.answers.length - 1].question5 = answer;
                        }

                        console.log("New entry!", obj.answers[obj.answers.length - 1])

                        var json = JSON.stringify(obj); //convert it back to json
                        fs.writeFile('answers.json', json, 'utf8', function (err) {
                            if (err) {
                                return console.log(err);
                                resolve(false)
                                return;
                            }
                            console.log("The file was saved!");
                            resolve(true)
                            return;
                        });  // write it back
                    }
                });
            }
        });
    });
}

async function getAnswerFromQuestion(pin, question) {
    pin = pin.toString()
    return new Promise(function (resolve, reject) {
        fs.readFile('answers.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
                resolve({})
                return;
            } else {
                var obj = JSON.parse(data); //now it an object

                for (let i = 0; i < obj.answers.length; i++) {
                    if (obj.answers[i] && obj.answers[i].pin === pin) {

                        if (question === "question1") {
                            const name = obj.answers[i].question1 && obj.answers[i].question1.name ? obj.answers[i].question1.name : "";
                            const age = obj.answers[i].question1 && obj.answers[i].question1.age ? obj.answers[i].question1.age : "";
                            resolve({name: name, age: age});
                            return;
                        } else if (question === "question2") {
                            const subject = obj.answers[i].question2 && obj.answers[i].question2.subject ? obj.answers[i].question2.subject : "";
                            resolve({subject: subject});
                            return;
                        } else if (question === "question3") {
                            const mostUsefull = obj.answers[i].question3 && obj.answers[i].question3.mostUsefull ? obj.answers[i].question3.mostUsefull : ""
                            resolve({mostUsefull: mostUsefull});
                            return;
                        } else if (question === "question4") {
                            const selectedOptions = obj.answers[i].question4 &&
                            obj.answers[i].question4.selectedOptions &&
                            obj.answers[i].question4.selectedOptions.length ?
                                obj.answers[i].question4.selectedOptions :
                                "";
                            resolve({selectedOptions: selectedOptions});
                            return;
                        } else if (question === "question5") {
                            const grade = obj.answers[i].question5 && obj.answers[i].question5.grade ? obj.answers[i].question5.grade : ""
                            resolve({grade: grade});
                            return;
                        } else {
                            resolve({})
                            return;
                        }
                    }
                }
                resolve({})
                return;
            }
        });
    });
}

async function navigateToWhatPage(pin) {
    pin = pin.toString()
    return new Promise(function (resolve, reject) {
        fs.readFile('answers.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                var obj = JSON.parse(data); //now it an object

                for (let i = 0; i < obj.answers.length; i++) {
                    if (obj.answers[i] && obj.answers[i].pin === pin) {

                        if (!obj.answers[i].question1 || !obj.answers[i].question1.name || !obj.answers[i].question1.age) {
                            resolve("question1")
                            return;
                        }
                        if (!obj.answers[i].question2 || !obj.answers[i].question2.subject) {
                            resolve("question2")
                            return;
                        }
                        if (!obj.answers[i].question3 || !obj.answers[i].question3.mostUsefull) {
                            resolve("question3")
                            return;
                        }
                        if (!obj.answers[i].question4 || !obj.answers[i].question4.selectedOptions || !obj.answers[i].question4.selectedOptions.length > 0) {
                            resolve("question4")
                            return;
                        }
                        if (!obj.answers[i].question5 || !obj.answers[i].question5.grade) {
                            resolve("question5")
                            return;
                        }

                        resolve("finished")
                        return;
                    }
                }
                resolve("new_user")
                return;
            }
        });
    });
}