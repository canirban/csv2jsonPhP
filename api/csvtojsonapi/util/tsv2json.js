const fs = require("async-file");
const _ = require("lodash");
const headers = [
  "Row ID",
  "Order ID",
  "Order Date",
  "Ship Date",
  "Ship Mode",
  "Customer ID",
  "Customer Name",
  "Segment",
  "Country",
  "City",
  "State",
  "Postal Code",
  "Region",
  "Product ID",
  "Category",
  "Sub-Category",
  "Product Name",
  "Sales",
  "Quantity",
  "Discount",
  "Profit",
];

const isHeaderValid = (constHeader, headers) => {
  if (headers.every((r) => constHeader.includes(r))) {
    return true;
  } else {
    return false;
  }
};
const response = {
  json: {},
  error: { message: "" },
};
const incorrectHeaderText =
  "\nIncorrect header hence Row ID cannot be parsed fot this line";
const getItemFromRow = (fields, header, headerString) => {
  return fields[_.indexOf(header, headerString)] || "";
};

const getProductUrlFromLineItem = (fields, header) => {
  try {
    const baseUrl = "https://www.foo.com";
    const category = getItemFromRow(fields, header, "Category");
    const subCategory = getItemFromRow(fields, header, "Sub-Category");
    const productId = getItemFromRow(fields, header, "Product ID");
    return encodeURI([baseUrl, category, subCategory, productId].join("/"));
  } catch (e) {
    const row = getItemFromRow(fields, header, "Row ID");
    response.error.message += row
      ? `\nError at Row Id ${row}. ${e.message}`
      : incorrectHeaderText;
    return "";
  }
};

const getPriceFromSales = (fields, header) => {
  try {
    const price = parseFloat(getItemFromRow(fields, header, "Sales"));
    const row = getItemFromRow(fields, header, "Row ID");
    if (isNaN(price)) {
      response.error.message += row
        ? `\nError at Row Id ${row}. Please enter a valid number for sales price, entered price is : ${getItemFromRow(
            fields,
            header,
            "Sales"
          )}. Hence setting it to null`
        : incorrectHeaderText;
    }
    return price;
  } catch (e) {
    response.error.message += `\nError at Row Id ${row}. ${e.message}`;
    return NaN;
  }
};

const orderDateToISODate = (orderDate) => {
  try {
    return new Date(orderDate).toISOString();
  } catch (e) {
    return "";
  }
};

const getISOOrderDateIfAfter = (fields, header, dateString) => {
  const row = getItemFromRow(fields, header, "Row ID");
  try {
    const orderDate = getItemFromRow(fields, header, "Order Date");
    if (orderDate && new Date(orderDate) > new Date(dateString)) {
      return orderDateToISODate(orderDate);
    } else {
      response.error.message += row
        ? `\nError at Row ${row}. Invalid date, Input date:${orderDate}. Hence not parsed`
        : incorrectHeaderText;
    }
  } catch (e) {
    response.error.message += `\nError at Row Id ${row}. ${e.message}`;
  }
  return null;
};

const getLineItem = (fields, header) => {
  return {
    product_url: getProductUrlFromLineItem(fields, header),
    revenue: getPriceFromSales(fields, header),
  };
};

const convertToEntry = (row, header) => {
  const entry = {};
  const customerName = getItemFromRow(row, header, "Customer Name");
  const order_id = getItemFromRow(row, header, "Order ID");
  const order_date = getISOOrderDateIfAfter(row, header, "7/31/2016");
  const line_items = [getLineItem(row, header)];
  return {
    [customerName]: {
      orders: [{ order_id, order_date, line_items }],
    },
  };
};

// TODO: Refactor to not mutate state, but collect and dedupe instead -- need a good way of merging arrays of nested objects
const createOrMergeEntries = (header, item, data) => {
  const key = Object.keys(item)[0]; // will only ever be one here, as the key is the actual Customer Name string
  const entry = data[key];
  if (entry) {
    for (let order of entry.orders) {
      const check = item[key].orders[0];
      if (order.order_id !== check.order_id) {
        entry.orders.push(check);
        break;
      } else {
        order.line_items.push(check.line_items[0]);
      }
    }
  } else {
    data[key] = item[key];
  }
};

const getOrderData = (lines, header) => {
  const data = {};
  const items = _.tail(lines)
    .map((row) => row.split("\t"))
    .filter((row) => getISOOrderDateIfAfter(row, header, "7/31/2016"))
    .map((row) => convertToEntry(row, header))
    .map((item) => createOrMergeEntries(header, item, data));
  return data;
};

const parseAsString = async (value) => {
  try {
    const content = value?.content || value;
    response.error.message = "";
    const lines = content.split("\n").filter((n) => n); // to remove empty spaces
    const header = lines[0].split("\t");
    const isValid = isHeaderValid(headers, header);
    if (!isValid) {
      response.error.message += `\nError at Header Please Enter a valid header, header must be similar to this ${JSON.stringify(
        headers
      )}`;
    }
    response.json = getOrderData(lines, header);
    return response;
  } catch (e) {
    response.error.message += `\nError occured while parsing. ${e.message}`;
  }
};

const parseAsFile = async (filename) => {
  try {
    response.error.message = "";
    const data = fs.readFile(filename, { encoding: "utf-8" });
    const lines = data.split("\n");
    const header = lines[0].split("\t");
    const isValid = isHeaderValid(headers, header);
    if (!isValid) {
      response.error.message += `\nError at Header Please Enter a valid header, header must be similar to this ${JSON.stringify(
        headers
      )}`;
    }
    response.json = getOrderData(lines, header);
    return response;
  } catch (e) {
    response.error.message += `\nError occured while parsing. ${e.message}`;
  }
};

module.exports = {
  parseAsFile,
  parseAsString,
  orderDateToISODate,
  getISOOrderDateIfAfter,
};
