const parseCountryAndYear = (filename) => {
  //This assumes the filename to be in the format of filename_country_year.xlsx
  filename = filename.substring(0, filename.lastIndexOf(".")); //Removes extension
  const data = filename.split("_");
  const [country, year] = data.slice(-2);
  return { country, year };
};

module.exports = { parseCountryAndYear };
