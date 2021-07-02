const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const client = require('@mailchimp/mailchimp_marketing');
const keys = require("./keys-lock.json")

const app = express();
const PORT = 5500;

client.setConfig({
    apiKey: keys.apiKey,
    server: 'us6',
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/sign-up", (req, res) => {
    let data = [
        {
            email_address: req.body.email,
            status: "subscribed",
            merge_fields: {
                FNAME: req.body.firstName,
                LNAME: req.body.lastName
            }
        }
    ]

    const run = async () => {
        const response = await client.lists.batchListMembers(keys.listID, {
            members: data,
        });
        
        if(response.error_count)
            res.sendFile(__dirname + "/failure.html");
        else    
            res.sendFile(__dirname + "/success.html");
    };

    run();
});

app.get('/list', (req, res) => {
    let baseUrl = "https://us6.api.mailchimp.com/3.0/lists";
    axios.get(baseUrl, {
        auth: {
            username: 'BigO',
            password: keys.apiKey
        }
    }).then((response) => res.send(response.data))
        .catch((err) => res.send(err));
})

app.listen(PORT, () => console.log("Server running on PORT: " + PORT));
