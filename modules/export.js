const XLSX = require("xlsx");
const JSON_FOLDER = "json";
const EXPORT_FOLDER = "export";
const fs = require("fs");

const catalogData = ["Lines", "Substations"];

const getFileType = (filename) => {
  filename = filename.replace(".json", "").split("_");
  return filename.slice(2).join("_");
};

const generateExcel = (fileNames, name) => {
  const workbook = XLSX.utils.book_new();
  fileNames.map(async (filename) => {
    const fileType = getFileType(filename);
    const filePath = `${JSON_FOLDER}/${filename}`;
    const jsonData = JSON.parse(fs.readFileSync(filePath));
    if (!jsonData?.rowData) {
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      XLSX.utils.book_append_sheet(workbook, worksheet, fileType);
    }
    if (jsonData?.rowData) {
      const columnKeys = Object.keys(jsonData?.columnData?.[0]);
      const columnValues = Object.values(jsonData?.columnData?.[0]);
      const rowsToAdd = columnKeys?.length;
      const worksheet = XLSX.utils.aoa_to_sheet([[]]);
      XLSX.utils.sheet_add_json(worksheet, jsonData?.rowData);
      const currentRef = worksheet["!ref"];
      let newWorkSheet = {};
      Object.keys(worksheet).map((key) => {
        if (key === "!ref") return;
        const alphabet = key.match(/[a-zA-Z]+/g);
        const number = parseInt(key.match(/\d+/g), 10) + rowsToAdd;
        newWorkSheet[`${alphabet}${number}`] = worksheet[key];
      });

      // Add Column A Data
      columnKeys.map((d, i) => {
        newWorkSheet[`A${i + 1}`] = {
          t: "s",
          v: `${d}`,
          r: `<t>${d}</t>`,
          h: `${d}`,
          w: `${d}`,
        };
      });

      // Add Column B Data
      columnValues.map((d, i) => {
        newWorkSheet[`B${i + 1}`] = {
          t: "n",
          v: Number(d),
          w: `${d}`,
        };
      });
      // Update Worksheet Ref
      const [start, end] = currentRef.split(":");
      const alphabetEnd = end.match(/[a-zA-Z]+/g);
      const numberEnd = parseInt(end.match(/\d+/g), 10) + rowsToAdd;
      newWorkSheet["!ref"] = `${start}:${alphabetEnd}${numberEnd}`;
      XLSX.utils.book_append_sheet(workbook, newWorkSheet, fileType);
    }
  });
  XLSX.writeFile(workbook, `${EXPORT_FOLDER}/${name}.xlsx`);
  fileNames.map(async (filename) => {
    const filePath = `${JSON_FOLDER}/${filename}`;
    fs.unlink(filePath, (err) => {
      if (!err) {
        console.log("File deleted successfully");
      }
    });
  });
};

const exportData = async (files) => {
  const catalogs = files?.filter((file) => {
    const fileType = getFileType(file);
    return catalogData.includes(fileType);
  });
  const genCatalogs = files?.filter((file) => {
    const fileType = getFileType(file);
    return !catalogData.includes(fileType);
  });
  generateExcel(catalogs, "Catalog");
  generateExcel(genCatalogs, "GenCatalog");
};

module.exports = { exportData };
