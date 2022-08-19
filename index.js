var express = require('express');
var bodyParser = require('body-parser')
var temp = require('temp').track();
var fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require("cors");

var app = express();
app.use(cors());
var jsonParser = bodyParser.json()

app.post('/compile', jsonParser, function(req, res){
    let compileText = "\\documentclass[12pt]{article}\n\\begin{document}\n" +
        `${[req.body.enunciado, req.body.alternativas, req.body.solucao].join("\n")}` +
        "\n\\end{document}"

    temp.mkdir('pdfcreator', (err, dirPath) => {
        const inputPath = path.join(dirPath, 'input.tex')
        const outputPath = path.join(dirPath, 'input.pdf')
        fs.writeFile(inputPath, compileText, (err) => {
            if (err) return res.status(400).json(err);
            exec(`latexmk -halt-on-error -output-directory="${dirPath}" -pdf ${inputPath}`, (err) => {
                if (err) return res.status(400).json(err);
                fs.readFile(outputPath, function(err, data) {
                    if (err) return res.status(400).json(err);
                    res.contentType("application/pdf");
                    res.send(data);
                });
            })
        })
    })
});

app.listen(process.env.PORT || 3333);