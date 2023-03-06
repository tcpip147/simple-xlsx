import { Sheet } from "./Sheet";
import _ from 'lodash';
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import { defaultFormat, isArray } from './XlsxStructure';
import { appendNode, removeNode, indexToAlphabet, alphabetToIndex } from './XlsxUtils';

function SimpleXlsx(option) {
    const xlsx = {};
    const ctx = {
        sheetOffset: 2
    };
    const parser = new XMLParser({ ignoreAttributes: false, isArray: isArray });
    for (let filename in defaultFormat) {
        xlsx[filename] = parser.parse(defaultFormat[filename]);
    }

    function createSheet(name) {
        let nextSheetId = 1;
        let nextRId = ctx.sheetOffset + 1;
        if (xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"] != null) {
            for (let i = 0; i < xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].length; i++) {
                const sheet = xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"][i];
                if (sheet["@_name"] == name) {
                    throw "A sheet name already exists : " + name;
                }
                nextSheetId = Math.max(nextSheetId, Number(sheet["@_sheetId"]));
                nextRId = ctx.sheetOffset + 1 + i;
            }
            nextSheetId++;
            nextRId++;
        }
        appendNode(xlsx, {
            "xl/workbook.xml": {
                workbook: {
                    sheets: {
                        sheet: [{ "@_name": name, "@_sheetId": nextSheetId, "@_r:id": 'rId' + nextRId }]
                    }
                }
            }
        });
        xlsx["xl/worksheets/sheet" + (nextRId - ctx.sheetOffset) + ".xml"] = parser.parse(`
            <?xml version="1.0" encoding="UTF-8"?>
            <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                <dimension ref="A1"/>
                <sheetViews>
                    <sheetView workbookViewId="0"/>
                </sheetViews>
                <sheetFormatPr defaultRowHeight="15.0"/>
                <sheetData>
                </sheetData>
                <pageMargins top="0.75" right="0.7" left="0.7" header="0.3" footer="0.3" bottom="0.75"/>
            </worksheet>
        `);
        appendNode(xlsx, {
            "xl/_rels/workbook.xml.rels": {
                Relationships: {
                    Relationship: [{
                        "@_Id": "rId" + nextRId,
                        "@_Target": "worksheets/sheet" + (nextRId - ctx.sheetOffset) + ".xml",
                        "@_Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"
                    }]
                }
            }
        });
        appendNode(xlsx, {
            "[Content_Types].xml": {
                Types: {
                    Override: [{
                        "@_ContentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
                        "@_PartName": "/xl/worksheets/sheet" + (nextRId - ctx.sheetOffset) + ".xml"
                    }]
                }
            }
        });
        return new Sheet({
            xlsx: xlsx,
            ctx: ctx,
            rId: nextRId
        });
    }

    function getSheetByName(name) {
        let rId;
        for (let i = 0; i < xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].length; i++) {
            const sheet = xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"][i];
            if (sheet["@_name"] == name) {
                rId = Number(sheet["@_r:id"].substring(3));
                break;
            }
        }
        if (rId) {
            return new Sheet({
                xlsx: xlsx,
                ctx: ctx,
                rId: rId
            });
        }
    }

    function getSheetByIndex(index) {
        if (index >= xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"].length) {
            throw "invalid index : " + index;
        }
        let rId = index + ctx.sheetOffset + 1;
        return new Sheet({
            xlsx: xlsx,
            ctx: ctx,
            rId: rId
        });
    }

    function write(name) {
        for (let key in xlsx) {
            if (key.startsWith("xl/worksheets")) {
                const sheetData = xlsx[key]["worksheet"]["sheetData"];
                if (sheetData.row) {
                    sheetData.row.sort(function (a, b) {
                        return Number(a["@_r"]) - Number(b["@_r"]);
                    });

                    for (let i = 0; i < sheetData.row.length; i++) {
                        sheetData.row[i].c.sort(function (a, b) {
                            return alphabetToIndex(a["@_r"].replace(/[0-9]+/, "")) - alphabetToIndex(b["@_r"].replace(/[0-9]+/, ""));
                        });
                    }
                }
            }
        }

        const builder = new XMLBuilder({ ignoreAttributes: false, isArray: isArray });
        const zip = new JSZip();
        for (let filename in xlsx) {
            const content = builder.build(xlsx[filename]);
            zip.file(filename, content);
        }
        zip.generateAsync({ type: "blob", compression: "DEFLATE" }).then(function (content) {
            saveAs(content, name);
        });
    }

    SimpleXlsx.prototype.createSheet = createSheet;
    SimpleXlsx.prototype.getSheetByName = getSheetByName;
    SimpleXlsx.prototype.getSheetByIndex = getSheetByIndex;
    SimpleXlsx.prototype.write = write;
}

export default SimpleXlsx;