const defaultFormat = {
    "_rels/.rels": `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml" Id="rId1"/>
            <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml" Id="rId2"/>
            <Relationship Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml" Id="rId3"/>
        </Relationships>
        `,
    "docProps/app.xml": `
        <?xml version="1.0" encoding="UTF-8"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
            <Application>Document</Application>
        </Properties>
        `,
    "docProps/core.xml": `
        <?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <cp:coreProperties xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
            <dcterms:created xsi:type="dcterms:W3CDTF">2023-02-28T11:23:36+09:00</dcterms:created>
            <dc:creator>Document</dc:creator>
        </cp:coreProperties>
        `,
    "xl/_rels/workbook.xml.rels": `
        <?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml" Id="rId1"/>
            <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" Id="rId2"/>
        </Relationships>
        `,
    "xl/sharedStrings.xml": `
        <?xml version="1.0" encoding="UTF-8"?>
        <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" uniqueCount="0" count="0"/>
        `,
    "xl/styles.xml": `
        <?xml version="1.0" encoding="UTF-8"?>
        <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
            <numFmts count="0"/>
            <fonts count="2">
                <font>
                    <sz val="11.0"/>
                    <color indexed="8"/>
                    <name val="Calibri"/>
                    <family val="2"/>
                    <scheme val="minor"/>
                </font>
                <font>
                    <strike />
                    <name val="맑은 고딕"/>
                    <sz val="11"/>
                </font>
            </fonts>
            <fills count="2">
                <fill>
                    <patternFill patternType="none"/>
                </fill>
                <fill>
                    <patternFill patternType="darkGray"/>
                </fill>
            </fills>
            <borders count="1">
                <border>
                    <left/>
                    <right/>
                    <top/>
                    <bottom/>
                    <diagonal/>
                </border>
            </borders>
            <cellStyleXfs count="1">
                <xf borderId="0" fillId="0" fontId="0" numFmtId="0"/>
            </cellStyleXfs>
            <cellXfs count="1">
                <xf borderId="0" fillId="0" fontId="0" numFmtId="0" xfId="0"/>
            </cellXfs>
        </styleSheet>
        `,
    "xl/workbook.xml": `
        <?xml version="1.0" encoding="UTF-8"?>
        <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <workbookPr date1904="false"/>
            <bookViews>
                <workbookView activeTab="0"/>
            </bookViews>
            <sheets/>
        </workbook>
        `,
    "[Content_Types].xml": `
        <?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" PartName="/docProps/app.xml"/>
            <Override ContentType="application/vnd.openxmlformats-package.core-properties+xml" PartName="/docProps/core.xml"/>
            <Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/>
            <Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/>
            <Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/>
        </Types>
        `
}

const isArray = function (name, jpath) {
    if (jpath === "workbook.sheets.sheet" ||
        jpath === "worksheet.sheetData.row" ||
        jpath === "worksheet.sheetData.row.c" ||
        jpath === "styleSheet.cellXfs.xf"
    ) {
        return true;
    }
    return false;
};

export {
    defaultFormat, isArray
}