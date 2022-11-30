const express = require("express");
const converter = require("./util/tsv2json");
const bodyParser = require("body-parser");
let app = express();
app.use(express.json());
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.post("/convert", urlencodedParser, async (req, res) => {
  try {
    const result = await converter.parseAsString(req.body.csv);
    result
      ? res.status(200).json(result)
      : res.status(500).json("Internal error occured");
  } catch (e) {
    res.status(500).json(`Internal error occured. Reason :${e.message}`);
  }
});

app.listen(3009, () => {
  console.log("App listening on port 3009!");
});
