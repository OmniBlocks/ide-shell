import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { ZstdCodec } from 'zstd-codec'
import { Buffer } from 'buffer';

const zstdCompress = async (buf) => {
  return new Promise((resolve) => {
    ZstdCodec.run((zstd) => {
      const simple = new zstd.Simple();
      const compressed = simple.compress(buf, 3);
      resolve(Buffer.from(compressed));
    });
  });
};

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithm: zstdCompress,
      filename: '[path][base].zst',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  base: './',
})