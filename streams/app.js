import { createReadStream, createWriteStream } from "fs";
import path from "path";

const inputFilePath = path.join(import.meta.dirname, "input.txt");
const outputFilePath = path.join(import.meta.dirname, "output.txt");

const readableStream = createReadStream(inputFilePath, {
  encoding: "utf-8",
  highWaterMark: 16,
});

const writeableStream = createWriteStream(outputFilePath);

// readableStream.pipe(writeableStream);

//! Listen for data chunks
readableStream.on("data", (chunk) => {
  console.log("Buffer (chunk): ", Buffer.from(chunk)); // convert the chunk to a buffer
  console.log("Recieved (chunk): ", chunk); // Logs each 16-byte chunk
  writeableStream.write(chunk); // write each chunk to output file
});

//! Handle stream end
readableStream.on("end", () => {
  console.log("File read completed.");
  writeableStream.end();
});

//! Handle error
readableStream.on("error", (err) => console.log("Error: ", err));
