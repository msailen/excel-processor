const XLXS = require("xlsx");
const fs = require("fs");

const ODD_WORKSHEETS = [
  {
    name: "ACDC_Converter",
    inverse: "A1:B4",
    range: 4,
    header: ["key", "value"],
  },
  {
    name: "Charge_Controller",
    inverse: "A1:B2",
    range: 2,
    header: ["key", "value"],
  },
];

const fetchDataFromSheet = (sheet, worksheet, fileName) => {
  const { status, options } = checkIfOddWorkSheet(sheet);
  let data = [];
  if (status) {
    const rowOptions = {
      range: options?.range,
      headers: 1,
    };
    const colOptions = {
      header: options.header,
      range: options.inverse,
    };
    const columnData = XLXS.utils
      .sheet_to_json(worksheet, colOptions)
      .reduce((accumulator, current) => {
        accumulator[current.key] = current.value;
        return accumulator;
      }, {});

    const rowData = XLXS.utils.sheet_to_json(worksheet, rowOptions);
    data = { columnData, rowData };
  } else {
    data = XLXS.utils.sheet_to_json(worksheet);
  }
  var json = JSON.stringify(data, null, 4);
  fs.writeFile(`output/${fileName}_${sheet}.json`, json, function (err) {
    if (err) console.log(err);
    console.log(`Successfully created ${fileName}_${sheet}.json`);
  });
};

const processBuffer = ({ country, year, buffer }) => {
  const fileName = `${country}_${year}`;
  const workbook = XLXS.read(buffer);
  const sheetNames = workbook.SheetNames;
  sheetNames.map(async (sheet) => {
    const worksheet = workbook.Sheets[sheet];
    fetchDataFromSheet(sheet, worksheet, fileName);
  });
};

const checkIfOddWorkSheet = (sheet) => {
  const filtered = ODD_WORKSHEETS?.filter((d) => d.name === sheet);
  if (filtered?.length) return { status: true, options: filtered[0] };
  return { status: false };
};

module.exports = { processBuffer };
