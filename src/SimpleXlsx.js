import XmlParser from "./XmlParser";
import Zip from "./Zip";

function SimpleXlsx() {
    new XmlParser();
    const zip = new Zip();

    SimpleXlsx.prototype.unzip = zip.unzip;
}

export default SimpleXlsx;