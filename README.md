# csv2jsonPhP

This repo can be divided into 3 parts

/api - is a node express project exposing an REST POST API to convert from csvtojson. It contains all the business logic for converting csv to json

/backend - is a php server which connects to the frontend, when the CSV form is submitted. The frontend makes a POST request to the php server which in regards makes a POST call to the node server. The response is then fed back to the frontend.

/frontend - is a NextJs frontend connecting to the backend php server for getting the converted csv to json

# Configuration:

Pre-requisites have Node, php installed
I've built the app in macOS and the installation steps are for macOS

1.open a terminal in api/csvtojsonapi

2.run node i

3.once successful start the nodeserver by node app.js

4.If successful you'll see something like this on the terminal : App listening on port 3009!


5.open a terminal in /backend 

6.run php -S localhost:8000


7.open a terminal in /frontend/csv2json

8.run npm i

9.run npm run dev

10.The frontend server will start in port 3000 if no other process is running.

11.Visit http://localhost:3000 fill the CSV field and press submit you'll get the parsed JSON with errors if any.

# Summary

After completing the above steps you will have something like this

FrontEnd NextJs server running on http://localhost:3000

Backend php server running on http://localhost:8000

Node server running on http://localhost:3009

