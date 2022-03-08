///<reference no-default-lib="true" />
///<reference lib="ES2021" />
///<reference lib="DOM" />

import {
  decode,
  encode,
} from "https://deno.land/std@0.128.0/encoding/ascii85.ts";
import { compress, decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { compress as lz4Compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";
import { gzipEncode } from "https://deno.land/x/wasm_gzip@v1.0.0/mod.ts";
const enc = (x: string) => new TextEncoder().encode(x);
const dec = (x: Uint8Array) => new TextDecoder().decode(x);

const ratio = (
  uncompressed: string,
  brotli: Uint8Array,
  lz4: Uint8Array,
  gzip: Uint8Array,
  encoded: string,
) =>
  [
    `Uncompressed     length: ${uncompressed.length}`,
    `brotli:         (length: ${brotli.byteLength}) ${
      brotli.byteLength / uncompressed.length
    }`,
    `lz4:            (length: ${lz4.byteLength}) ${
      lz4.byteLength / uncompressed.length
    }`,
    `gzip:           (length: ${gzip.byteLength}) ${
      gzip.byteLength / uncompressed.length
    }`,
    `brotli+ascii85: (length: ${encoded.length}) ${
      encoded.length / uncompressed.length
    }`,
    `URL:            (length: ${encodeURIComponent(encoded).length}) ${
      encodeURIComponent(encoded).length / uncompressed.length
    }`,
  ].join("\n");

const input = document.getElementById("input") as HTMLTextAreaElement;
const output_brotli = document.getElementById(
  "output_brotli",
) as HTMLTextAreaElement;
const output_lz4 = document.getElementById("output_lz4") as HTMLTextAreaElement;
const output_gzip = document.getElementById(
  "output_gzip",
) as HTMLTextAreaElement;
const decoded = document.getElementById("decoded") as HTMLTextAreaElement;
const info = document.getElementById("info") as HTMLTextAreaElement;

const updateFromInput = () => {
  const encoded = enc(input.value);
  const brotli = compress(encoded);
  const lz4 = lz4Compress(encoded);
  const gzip = gzipEncode(encoded);
  output_brotli.value = encode(brotli);
  output_lz4.value = encode(lz4);
  output_gzip.value = encode(gzip);
  decoded.value = dec(decompress(decode(output_brotli.value)));
  info.textContent = ratio(
    input.value,
    brotli,
    lz4,
    gzip,
    output_brotli.value,
  );
  history.replaceState(
    null,
    document.title,
    "#" + encodeURIComponent(output_brotli.value),
  );
};
const updateFromOutput = () => {
  const compressed = decode(output_brotli.value);
  const decompressed = decompress(compressed);
  const txt = dec(decompressed);
  input.value = txt;
  decoded.value = txt;
  const lz4 = lz4Compress(decompressed);
  const gzip = gzipEncode(decompressed);
  output_lz4.value = encode(lz4);
  output_gzip.value = encode(gzip);
  info.textContent = ratio(
    input.value,
    compressed,
    lz4,
    gzip,
    output_brotli.value,
  );
  history.replaceState(
    null,
    document.title,
    "#" + encodeURIComponent(output_brotli.value),
  );
};

input.addEventListener("input", updateFromInput);
output_brotli.addEventListener("input", updateFromOutput);

const urlValue = location.hash.slice(1);
output_brotli.value = decodeURIComponent(urlValue);
updateFromOutput();
