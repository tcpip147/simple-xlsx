const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const JSZip = require("jszip");
const { saveAs } = require('file-saver');
const { defaultFormat } = require('./DefaultFormat');

function SimpleXlsx(option) {
    const xlsx = {};
    const isArray = function (name, jpath, isLeafNode, isAttribute) {
        if (jpath === "workbook.sheets.sheet") {
            return true;
        } else {
            return false;
        }
    };

    const parser = new XMLParser({
        ignoreAttributes: false,
        isArray: isArray
    });
    for (let filename in defaultFormat) {
        xlsx[filename] = parser.parse(defaultFormat[filename]);
    }

    function getDoc() {
        return xlsx;
    }

    function appendWorksheet(name) {
        if (xlsx["xl/workbook.xml"]["workbook"]["sheets"] === "") {
            xlsx["xl/workbook.xml"]["workbook"]["sheets"] = {};
            xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"] = [];
        }
        xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].push({ "@_name": name, "@_sheetId": "1", "@_r:id": 'rId1' });
    }

    function removeWorksheet(name) {
        if (xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"]) {
            for (let i = 0; i < xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].length; i++) {
                if (xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"][i]["@_name"] === name) {
                    xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].splice(i, 1);
                }
            }
            if (xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].length === 0) {
                xlsx["xl/workbook.xml"]["workbook"]["sheets"] = "";
            }
        }
    }

    function output(name) {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            isArray: isArray
        });
        const zip = new JSZip();
        for (let filename in xlsx) {
            const content = builder.build(xlsx[filename]);
            zip.file(filename, content);
        }
        zip.generateAsync({ type: "blob", compression: "DEFLATE" }).then(function (content) {
            saveAs(content, name + ".xlsx");
        });
    }

    SimpleXlsx.prototype.getDoc = getDoc;
    SimpleXlsx.prototype.appendWorksheet = appendWorksheet;
    SimpleXlsx.prototype.removeWorksheet = removeWorksheet;
    SimpleXlsx.prototype.output = output;
}

export default SimpleXlsx;