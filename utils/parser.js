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

const trimArrayOfObjects = (data) => {
  return data?.map((d) => {
    return Object.keys(d).reduce((acc, key) => {
      acc[key.trim()] = d[key];
      return acc;
    }, {});
  });
};

const sanitizeData = (data) => {
  if (data?.length) {
    return trimArrayOfObjects(data);
  }
  if (data?.columnData) {
    const columnData = trimArrayOfObjects(data.columnData);
    const rowData = trimArrayOfObjects(data.rowData);
    return { columnData, rowData };
  }
  return data;
};

const fetchDataFromSheet = ({ sheet, worksheet, fileName, path }) => {
  const { status, options } = checkIfOddWorkSheet(sheet);
  let data = [];
  if (status) {
    console.log(worksheet);
    const rowOptions = {
      range: options?.range,
      headers: 1,
    };
    const colOptions = {
      header: options.header,
      range: options.inverse,
    };
    let columnData = XLXS.utils
      .sheet_to_json(worksheet, colOptions)
      .reduce((accumulator, current) => {
        accumulator[current.key] = current.value;
        return accumulator;
      }, {});

    const rowData = XLXS.utils.sheet_to_json(worksheet, rowOptions);
    data = { columnData: [columnData], rowData };
  } else {
    data = XLXS.utils.sheet_to_json(worksheet);
  }
  data = sanitizeData(data);
  var json = JSON.stringify(data, null, 4);
  fs.writeFile(`json/${fileName}_${sheet}.json`, json, function (err) {
    if (!err) {
      console.log("Output Created Successfully");
    }
  });
};

const processFile = ({ country, year, path }) => {
  const fileName = `${country}_${year}`;
  const workbook = XLXS.readFile(path);
  const sheetNames = workbook.SheetNames;
  sheetNames.map(async (sheet) => {
    const worksheet = workbook.Sheets[sheet];
    fetchDataFromSheet({ sheet, worksheet, fileName, path });
  });
  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File deleted successfully");
    }
  });
};

const checkIfOddWorkSheet = (sheet) => {
  const filtered = ODD_WORKSHEETS?.filter((d) => d.name === sheet);
  if (filtered?.length) return { status: true, options: filtered[0] };
  return { status: false };
};

module.exports = { processFile };
