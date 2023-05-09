const XLSX = require("xlsx");
const JSON_FOLDER = "json";
const EXPORT_FOLDER = "export";
const fs = require("fs");

const catalogData = ["Lines", "Substations"];

const getFileType = (filename) => {
  filename = filename.replace(".json", "").split("_");
  return filename[filename.length - 1];
};

const exportData = async (files) => {
  const catalogs = files?.filter((file) => {
    const fileType = getFileType(file);
    return catalogData.includes(fileType);
  });
  const catalogWorkbook = XLSX.utils.book_new();
  catalogs.map(async (catalog) => {
    const fileType = getFileType(catalog);
    const filePath = `${JSON_FOLDER}/${catalog}`;
    const jsonData = JSON.parse(fs.readFileSync(filePath));
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.book_append_sheet(catalogWorkbook, worksheet, fileType);
  });
  XLSX.writeFile(catalogWorkbook, `${EXPORT_FOLDER}/Catalog.xlsx`);
};

module.exports = { exportData };
