function Zip() {
    let data;

    function unzip(d) {
        data = d;
        validateSignature();
        parse();

        function validateSignature() {
            if (data == null || data.length < 4) {
                throw "Invalid file";
            }

            if (!match(0, 4, [80, 75, 3, 4])) {
                throw "This file is not zip file.";
            }
        }

        function match(start, len, expect) {
            for (let i = 0; i < len; i++) {
                if (sarr(start + i, 1)[0] != expect[i]) {
                    return false;
                }
            }
            return true;
        }

        function sarr(offset, len) {
            return data.subarray(offset, offset + len);
        }

        function btoi(bytes) {
            let pow = 1;
            let num = 0;
            for (let i = 0; i < bytes.length; i++) {
                num += bytes[i] * pow;
                pow *= 256;
            }
            return num;
        }

        function btoascii(bytes) {
            let filename = "";
            for (let i = 0; i < bytes.length; i++) {
                filename += String.fromCharCode(bytes[i]);
            }
            return filename;
        }

        function parse() {
            const eocdr = parseEndOfCentralDirectoryRecord();
            const offsetCd = btoi(eocdr.offsetOfStartOfCentralDirectoryWithRespectToTheStartingDiskNumber());
            const headers = parseCentralDirectoryHeaders(offsetCd);
            for (let i = 0; i < headers.length; i++) {
                const offsetLfh = btoi(headers[i].relativeOffsetOfLocalHeader());
                const localFileHeader = new LocalFileHeader(offsetLfh);
                const offsetFd = 30 + btoi(localFileHeader.fileNameLength()) + btoi(localFileHeader.extraFieldLength());
                const filename = btoascii(localFileHeader.fileName());
                const fileData = sarr(offsetFd, btoi(localFileHeader.compressedSize()));
            }
        }

        function parseEndOfCentralDirectoryRecord() {
            let offset;
            for (let i = data.length - 1; i >= 0; i--) {
                if (sarr(i, 1)[0] == 80) {
                    if (match(i, 4, [80, 75, 5, 6])) {
                        offset = i;
                        break;
                    }
                }
            }
            return new EndOfCentralDirectoryRecord(offset);
        }

        function parseCentralDirectoryHeaders(offset) {
            let headerOffset = offset;
            const headers = [];
            while (match(headerOffset, 4, [80, 75, 1, 2])) {
                const cd = new CentralDirectoryHeader(headerOffset);
                headers.push(cd);
                headerOffset += 46 + btoi(cd.fileNameLength()) + btoi(cd.extraFieldLength()) + btoi(cd.fileCommentLength());
            }
            return headers;
        }

        /*
         * Structures
         */
        function EndOfCentralDirectoryRecord(offset) {
            this.offset = offset;

            EndOfCentralDirectoryRecord.prototype.endOfCentralDirSignatrue = function () {
                return sarr(this.offset, 4);
            };

            EndOfCentralDirectoryRecord.prototype.numberOfThisDisk = function () {
                return sarr(this.offset + 4, 2);
            };

            EndOfCentralDirectoryRecord.prototype.numberOfThisDiskWithTheStartOfTheCentralDirectory = function () {
                return sarr(this.offset + 6, 2);
            };

            EndOfCentralDirectoryRecord.prototype.totalNumberOfEntriesInTheCentralDirectoryOnThisDisk = function () {
                return sarr(this.offset + 8, 2);
            };

            EndOfCentralDirectoryRecord.prototype.totalNumberOfEntriesInTheCentralDirectory = function () {
                return sarr(this.offset + 10, 2);
            };

            EndOfCentralDirectoryRecord.prototype.sizeOfTheCentralDirectory = function () {
                return sarr(this.offset + 12, 4);
            };

            EndOfCentralDirectoryRecord.prototype.offsetOfStartOfCentralDirectoryWithRespectToTheStartingDiskNumber = function () {
                return sarr(this.offset + 16, 4);
            };

            EndOfCentralDirectoryRecord.prototype.zipFileCommentLength = function () {
                return sarr(this.offset + 20, 2);
            };

            EndOfCentralDirectoryRecord.prototype.zipFileComment = function () {
                const length = btoi(this.zipFileCommentLength());
                return sarr(this.offset + 22, length);
            };
        }

        function CentralDirectoryHeader(offset) {
            this.offset = offset;

            CentralDirectoryHeader.prototype.centralFileHeaderSignature = function () {
                return sarr(this.offset, 4);
            };

            CentralDirectoryHeader.prototype.versionMadeBy = function () {
                return sarr(this.offset + 4, 2);
            };

            CentralDirectoryHeader.prototype.versionNeededToExtract = function () {
                return sarr(this.offset + 6, 2);
            };

            CentralDirectoryHeader.prototype.generalPurposeBitFlag = function () {
                return sarr(this.offset + 8, 2);
            };

            CentralDirectoryHeader.prototype.compressionMethod = function () {
                return sarr(this.offset + 10, 2);
            };

            CentralDirectoryHeader.prototype.lastModFileTime = function () {
                return sarr(this.offset + 12, 2);
            };

            CentralDirectoryHeader.prototype.lastModFileDate = function () {
                return sarr(this.offset + 14, 2);
            };

            CentralDirectoryHeader.prototype.crc32 = function () {
                return sarr(this.offset + 16, 4);
            };

            CentralDirectoryHeader.prototype.compressedSize = function () {
                return sarr(this.offset + 20, 4);
            };

            CentralDirectoryHeader.prototype.uncompressedSize = function () {
                return sarr(this.offset + 24, 4);
            };

            CentralDirectoryHeader.prototype.fileNameLength = function () {
                return sarr(this.offset + 28, 2);
            };

            CentralDirectoryHeader.prototype.extraFieldLength = function () {
                return sarr(this.offset + 30, 2);
            };

            CentralDirectoryHeader.prototype.fileCommentLength = function () {
                return sarr(this.offset + 32, 2);
            };

            CentralDirectoryHeader.prototype.diskNumberStart = function () {
                return sarr(this.offset + 34, 2);
            };

            CentralDirectoryHeader.prototype.internalFileAttributes = function () {
                return sarr(this.offset + 36, 2);
            };

            CentralDirectoryHeader.prototype.externalFileAttributes = function () {
                return sarr(this.offset + 38, 4);
            };

            CentralDirectoryHeader.prototype.relativeOffsetOfLocalHeader = function () {
                return sarr(this.offset + 42, 4);
            };

            CentralDirectoryHeader.prototype.fileName = function () {
                const length = btoi(this.fileNameLength());
                return sarr(this.offset + 46, length);
            };

            CentralDirectoryHeader.prototype.extraField = function () {
                const extraOffset = btoi(this.fileNameLength());
                const length = btoi(this.extraFieldLength());
                return sarr(this.offset + 46 + extraOffset, length);
            };

            CentralDirectoryHeader.prototype.fileComment = function () {
                const extraOffset = btoi(this.fileNameLength()) + btoi(this.extraFieldLength());
                const length = btoi(this.fileCommentLength());
                return sarr(this.offset + 46 + extraOffset, length);
            };
        }

        function LocalFileHeader(offset) {
            this.offset = offset;

            LocalFileHeader.prototype.localFileHeaderSignature = function () {
                return sarr(this.offset, 4);
            };

            LocalFileHeader.prototype.versionNeededToExtract = function () {
                return sarr(this.offset + 4, 2);
            };

            LocalFileHeader.prototype.generalPurposeBitFlag = function () {
                return sarr(this.offset + 6, 2);
            };

            LocalFileHeader.prototype.compressionMethod = function () {
                return sarr(this.offset + 8, 2);
            };

            LocalFileHeader.prototype.lastModFileTime = function () {
                return sarr(this.offset + 10, 2);
            };

            LocalFileHeader.prototype.lastModFileDate = function () {
                return sarr(this.offset + 12, 2);
            };

            LocalFileHeader.prototype.crc32 = function () {
                return sarr(this.offset + 14, 4);
            };

            LocalFileHeader.prototype.compressedSize = function () {
                return sarr(this.offset + 18, 4);
            };

            LocalFileHeader.prototype.uncompressedSize = function () {
                return sarr(this.offset + 22, 4);
            };

            LocalFileHeader.prototype.fileNameLength = function () {
                return sarr(this.offset + 26, 2);
            };

            LocalFileHeader.prototype.extraFieldLength = function () {
                return sarr(this.offset + 28, 2);
            };

            LocalFileHeader.prototype.fileName = function () {
                const length = btoi(this.fileNameLength());
                return sarr(this.offset + 30, length);
            };

            LocalFileHeader.prototype.extraField = function () {
                const extraOffset = btoi(this.fileNameLength());
                const length = btoi(this.extraFieldLength());
                return sarr(this.offset + 30 + extraOffset, length);
            };
        }
    }

    Zip.prototype.unzip = unzip;
}

export default Zip;