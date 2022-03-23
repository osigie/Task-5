import http, { IncomingMessage, Server, ServerResponse } from "http";

const fs = require("fs");

// To check if the file exist from the beginning , else create a newfile

let isExit = fs.existsSync(
  "/Users/user/Desktop/Dev/week-5-node-010-osigie/server/lib/data/products.json"
);
if (!isExit) {
  fs.writeFileSync(
    "/Users/user/Desktop/Dev/week-5-node-010-osigie/server/lib/data/products.json",
    JSON.stringify([])
  );
}

/*
implement your server code here
*/
const { v4: uuidv4 } = require("uuid");
let products = require("./data/products.json");

interface ProductData {
  id?: string;
  organization?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: string;
  marketValue?: string;
  address?: string;
  ceo?: string;
  country?: string;

  noOfEmployees?: number;
  employees?: string[];
}

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/api/products" && req.method === "GET") {
      getProducts(req, res);
    } else if (req.url?.match(/\/api\/products\/\w+/) && req.method === "GET") {
      const id = req.url.split("/")[3];
      getProduct(req, res, id);
    } else if (req.url === "/api/products" && req.method === "POST") {
      res.writeHead(200, { "Content-Type": "application/json" });
      createProduct(req, res);
    } else if (req.url?.match(/\/api\/products\/\w+/) && req.method === "PUT") {
      const id = req.url.split("/")[3];
      updateProduct(req, res, id);
    } else if (
      req.url?.match(/\/api\/products\/\w+/) &&
      req.method === "DELETE"
    ) {
      const id = req.url.split("/")[3];
      deleteProduct(req, res, id);
    } else {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "Route not found" }));
    }
  }
);
const PORT = process.env.PORT || 6000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// @desc    Gets All Products
// @route   GET /api/products
async function getProducts(req: IncomingMessage, res: ServerResponse) {
  try {
    const productEl = await findAll();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(productEl));
  } catch (error) {
    console.log(error);
  }
}

// @desc    Gets Single Product
// @route   GET /api/product/:id
async function getProduct(
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) {
  try {
    const product = await findById(id);

    if (!product) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product Not Found" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    }
  } catch (error) {
    console.log(error);
  }
}

//function to get all data from the database
function findAll() {
  return new Promise((resolve, reject) => {
    resolve(products);
  });
}

//function to get data by id from the database
function findById(id: string): Promise<object> {
  return new Promise((resolve, reject) => {
    const product = products.find((p: ProductData) => p.id === id);
    resolve(product);
  });
}

//function to write data to the database
function writeData() {
  fs.writeFileSync(
    "/Users/user/Desktop/Dev/week-5-node-010-osigie/server/lib/data/products.json",
    JSON.stringify(products, null, 2),
    "utf8",
    (err: Error) => {
      if (err) {
        console.log(err);
      }
    }
  );
}

// function to create data and adding the ids
function create(product: ProductData) {
  return new Promise((resolve, reject) => {
    const newProduct = { id: uuidv4(), ...product };
    products.push(newProduct);
    if (process.env.NODE_ENV !== "test") {
      writeData();
    }
    resolve(newProduct);
  });
}

// function to get post data
function getPostData(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let body: string = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        resolve(body);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// @desc    Create a Product
// @route   POST /api/products
async function createProduct(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await getPostData(req);

    const {
      organization,
      createdAt,
      updatedAt,
      products,
      marketValue,
      address,
      ceo,
      country,
      noOfEmployees,
      employees,
    } = JSON.parse(body);

    const product = {
      organization,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products,
      marketValue,
      address,
      ceo,
      country,
      noOfEmployees,
      employees,
    };

    const newProduct = await create(product);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(newProduct));
  } catch (error) {
    console.log(error);
  }
}

// @desc    Update a Product
// @route   PUT /api/products/:id
async function updateProduct(
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) {
  try {
    const company: ProductData = await findById(id);

    if (!company) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product Not Found" }));
    } else {
      const body = await getPostData(req);

      const {
        organization,
        createdAt,
        updatedAt,
        products,
        marketValue,
        address,
        ceo,
        country,
        noOfEmployees,
        employees,
      } = JSON.parse(body);

      const product = {
        organization: organization || company.organization,
        createdAt: createdAt || company.createdAt,
        updatedAt: new Date().toISOString(),
        products: products || company.products,
        marketValue: marketValue || company.marketValue,
        address: address || company.address,
        ceo: ceo || company.ceo,
        country: country || company.country,
        noOfEmployees: noOfEmployees || company.noOfEmployees,
        employees: employees || company.employees,
      };

      const updProduct = await update(id, product);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(updProduct));
    }
  } catch (error) {
    console.log(error);
  }
}

//function to update the database
function update(id: string, product: ProductData) {
  return new Promise((resolve, reject) => {
    const index = products.findIndex((p: { id: string }) => p.id === id);
    products[index] = { id, ...product };
    if (process.env.NODE_ENV !== "test") {
      writeData();
    }
    resolve(products[index]);
  });
}

//function to remove data from database
function remove(id: string) {
  return new Promise((resolve, reject) => {
    products = products.filter((p: { id: string }) => p.id !== id);
    if (process.env.NODE_ENV !== "test") {
      writeData();
    }
    resolve("");
  });
}

// @desc    Delete Product
// @route   DELETE /api/product/:id
async function deleteProduct(
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) {
  try {
    const product = await findById(id);

    if (!product) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product Not Found" }));
    } else {
      await remove(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `Product ${id} removed` }));
    }
  } catch (error) {
    console.log(error);
  }
}
