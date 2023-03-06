import _ from 'lodash';
import { XlsxStyle } from './XlsxStyle';

const { appendNode, removeNode, alphabetToIndex, indexToAlphabet } = require('./XlsxUtils');

function Sheet(option) {
    this.xlsx = option.xlsx;
    this.ctx = option.ctx;
    this.rId = option.rId;
    this.available = true;
    this.rows = {};

    const sheetData = this.xlsx["xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml"]["worksheet"]["sheetData"];
    if (sheetData.row) {
        for (let i = 0; i < sheetData.row.length; i++) {
            const row = sheetData.row[i];
            const rowIndex = Number(row["@_r"]) - 1;
            if (!this.rows[rowIndex]) {
                this.rows[rowIndex] = {
                    origin: row
                };
            }
            for (let j = 0; j < row.c.length; j++) {
                const colIndex = alphabetToIndex(row.c[j]["@_r"].replace(/[0-9]+/, ""));
                this.rows[rowIndex][colIndex - 1] = {
                    origin: row.c[j]
                };
            }
        }
    }

    function setCellValue(row, col, type, value) {
        if (this.rows[row] == null) {
            const r = {
                c: [],
                "@_r": (row + 1).toString()
            };
            if (this.xlsx["xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml"]["worksheet"]["sheetData"]["row"] == null) {
                this.xlsx["xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml"]["worksheet"]["sheetData"] = {};
                this.xlsx["xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml"]["worksheet"]["sheetData"]["row"] = [];
            }
            this.xlsx["xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml"]["worksheet"]["sheetData"]["row"].push(r);
            this.rows[row] = {
                origin: r
            };
        }

        if (this.rows[row][col] == null) {
            const c = {
                "@_r": indexToAlphabet(col + 1) + (row + 1)
            };
            if (type == "String") {
                c["@_t"] = "inlineStr";
                c["is"] = {
                    "t": value
                }
            } else {

            }
            this.rows[row].origin.c.push(c);
            this.rows[row][col] = {
                origin: c
            };
        }
    }

    function remove() {
        if (!this.available) {
            throw "This instance is not available.";
        }
        removeNode(this.xlsx["xl/workbook.xml"]["workbook"]["sheets"]["sheet"], { "@_r:id": "rId" + this.rId });
        delete this.xlsx["xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml"];
        removeNode(this.xlsx["xl/_rels/workbook.xml.rels"]["Relationships"]["Relationship"], { "@_Id": "rId" + this.rId });
        removeNode(this.xlsx["[Content_Types].xml"]["Types"]["Override"], { "@_PartName": "/xl/worksheets/sheet" + (this.rId - this.ctx.sheetOffset) + ".xml" });
        this.available = false;
    }

    function setCellStyle(row, col, styles) {
        const fontStyles = {};
        const fillStyles = {};

        for (let key in styles) {
            if (key == "fontName") {
                fontStyles["name"] = {
                    "@_val": styles[key]
                };
            } else if (key == "fontBold") {
                if (styles[key]) {
                    fontStyles["b"] = '';
                }
            } else if (key == "fontItalic") {
                if (styles[key]) {
                    fontStyles["i"] = '';
                }
            } else if (key == "fontStrike") {
                if (styles[key]) {
                    fontStyles["strike"] = '';
                }
            } else if (key == "fontColor") {
                fontStyles["color"] = {
                    "@_rgb": styles[key]
                };
            } else if (key == "fontSize") {
                fontStyles["sz"] = {
                    "@_val": styles[key].toString()
                };
            } else if (key == "fontUnderline") {
                fontStyles["u"] = {
                    "@_val": styles[key]
                };
            } else if (key == "fontVerticalAlign") {
                fontStyles["vertAlign"] = {
                    "@_val": styles[key]
                };
            } else if (key == "backgroundColor") {
                fillStyles["patternFill"] = {
                    "@_patternType": "solid",
                    "fgColor": {
                        "@_rgb": styles[key]
                    }
                };
            }
        }

        let borderId = 0;
        let fillId = 0;
        let fontId = 0;
        let numFmtId = 0;
        let xfId = 0;

        if (!_.isEmpty(fontStyles)) {
            _.each(this.xlsx["xl/styles.xml"]["styleSheet"]["fonts"]["font"], function (style, i) {
                if (_.isEqual(style, fontStyles)) {
                    fontId = i;
                }
            });

            if (fontId == 0) {
                this.xlsx["xl/styles.xml"]["styleSheet"]["fonts"]["font"].push(fontStyles);
                fontId = this.xlsx["xl/styles.xml"]["styleSheet"]["fonts"]["font"].length - 1;
                this.xlsx["xl/styles.xml"]["styleSheet"]["fonts"]["@_count"] = fontId + 1;
            }
        }

        if (!_.isEmpty(fillStyles)) {
            _.each(this.xlsx["xl/styles.xml"]["styleSheet"]["fills"]["fill"], function (style, i) {
                if (_.isEqual(style, fillStyles)) {
                    fillId = i;
                }
            });

            if (fillId == 0) {
                this.xlsx["xl/styles.xml"]["styleSheet"]["fills"]["fill"].push(fillStyles);
                fillId = this.xlsx["xl/styles.xml"]["styleSheet"]["fills"]["fill"].length - 1;
                this.xlsx["xl/styles.xml"]["styleSheet"]["fills"]["@_count"] = fillId + 1;
            }
        }

        const xfStyles = {
            "@_borderId": borderId.toString(),
            "@_fillId": fillId.toString(),
            "@_fontId": fontId.toString(),
            "@_numFmtId": numFmtId.toString(),
            "@_xfId": xfId.toString(),
        };

        let styleNum = 0;
        _.each(this.xlsx["xl/styles.xml"]["styleSheet"]["cellXfs"]["xf"], function (style, i) {
            if (_.isEqual(style, xfStyles)) {
                styleNum = i;
            }
        });

        if (styleNum == 0) {
            this.xlsx["xl/styles.xml"]["styleSheet"]["cellXfs"]["xf"].push(xfStyles);
            styleNum = this.xlsx["xl/styles.xml"]["styleSheet"]["cellXfs"]["xf"].length - 1;
            this.xlsx["xl/styles.xml"]["styleSheet"]["cellXfs"]["@_count"] = styleNum + 1;
        }

        if (this.rows[row][col] == null) {
            this.setCellValue(row, col, null, null);
        }
        this.rows[row][col].origin["@_s"] = styleNum.toString();
    }

    Sheet.prototype.setCellValue = setCellValue;
    Sheet.prototype.setCellStyle = setCellStyle;
    Sheet.prototype.remove = remove;
}

export {
    Sheet
}