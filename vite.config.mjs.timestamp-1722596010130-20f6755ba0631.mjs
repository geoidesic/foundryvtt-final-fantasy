// vite.config.mjs
import { svelte } from "file:///Users/noeldacosta/code/foundryvtt-final-fantasy/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import resolve from "file:///Users/noeldacosta/code/foundryvtt-final-fantasy/node_modules/@rollup/plugin-node-resolve/dist/es/index.js";
import preprocess from "file:///Users/noeldacosta/code/foundryvtt-final-fantasy/node_modules/svelte-preprocess/dist/index.js";

// src/helpers/constants.js
var SYSTEM_ID = "foundryvtt-final-fantasy";
var SYSTEM_CODE = "FF15";
var LOG_PREFIX = `${SYSTEM_CODE} |`;
var ASSET_PATH = `systems/${SYSTEM_ID}/assets`;

// vite.config.mjs
import { postcssConfig, terserConfig, typhonjsRuntime } from "file:///Users/noeldacosta/code/foundryvtt-final-fantasy/node_modules/@typhonjs-fvtt/runtime/.rollup/remote/index.js";
import * as path from "path";
var __vite_injected_original_dirname = "/Users/noeldacosta/code/foundryvtt-final-fantasy";
var s_COMPRESS = false;
var s_SOURCEMAPS = true;
var s_TYPHONJS_MODULE_LIB = false;
var s_RESOLVE_CONFIG = {
  browser: true,
  dedupe: ["svelte"]
};
var vite_config_default = () => {
  return {
    root: "src/",
    // Source location / esbuild root.
    base: `/systems/${SYSTEM_ID}/`,
    // Base module path that 30001 / served dev directory.
    publicDir: false,
    // No public resources to copy.
    cacheDir: "../.vite-cache",
    // Relative from root directory.
    test: {
      mockReset: true,
      globals: true
    },
    resolve: {
      conditions: ["import", "browser"],
      alias: {
        "~": path.resolve(__vite_injected_original_dirname)
      }
    },
    esbuild: {
      target: ["es2022", "chrome100"],
      keepNames: true
      // Note: doesn't seem to work.
    },
    css: {
      // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
      postcss: postcssConfig({ compress: s_COMPRESS, sourceMap: s_SOURCEMAPS })
    },
    // About server options:
    // - Set to `open` to boolean `false` to not open a browser window automatically. This is useful if you set up a
    // debugger instance in your IDE and launch it with the URL: 'http://localhost:30001/game'.
    //
    // - The top proxy entry for `lang` will pull the language resources from the main Foundry / 30000 server. This
    // is necessary to reference the dev resources as the root is `/src` and there is no public / static resources
    // served.
    server: {
      port: 30001,
      // open: "/game",
      open: false,
      proxy: {
        [`^(/systems/${SYSTEM_ID}/(lang|packs|assets))`]: "http://localhost:30000",
        [`^(/systems/${SYSTEM_ID}/style.css)`]: "http://localhost:30000",
        [`^(?!/systems/${SYSTEM_ID}/)`]: "http://localhost:30000",
        "/socket.io": { target: "ws://localhost:30000", ws: true }
      }
    },
    build: {
      outDir: __vite_injected_original_dirname,
      emptyOutDir: false,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_COMPRESS ? "terser" : false,
      target: ["es2022", "chrome100"],
      terserOptions: s_COMPRESS ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: "./index.js",
        formats: ["es"],
        fileName: "index"
      }
    },
    plugins: [
      svelte({
        compilerOptions: {
          // Provides a custom hash adding the string defined in `s_SVELTE_HASH_ID` to scoped Svelte styles;
          // This is reasonable to do as the framework styles in TRL compiled across `n` different packages will
          // be the same. Slightly modifying the hash ensures that your package has uniquely scoped styles for all
          // TRL components and makes it easier to review styles in the browser debugger.
          cssHash: ({ hash, css }) => `svelte-${SYSTEM_CODE}-${hash(css)}`
        },
        preprocess: preprocess(),
        onwarn: (warning, handler) => {
          if (warning.message.includes(`<a> element should have an href attribute`)) {
            return;
          }
          handler(warning);
        }
      }),
      resolve(s_RESOLVE_CONFIG),
      // Necessary when bundling npm-linked packages.
      // When s_TYPHONJS_MODULE_LIB is true transpile against the Foundry module version of TRL.
      s_TYPHONJS_MODULE_LIB && typhonjsRuntime()
    ]
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIiwgInNyYy9oZWxwZXJzL2NvbnN0YW50cy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9ub2VsZGFjb3N0YS9jb2RlL2ZvdW5kcnl2dHQtZmluYWwtZmFudGFzeVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL25vZWxkYWNvc3RhL2NvZGUvZm91bmRyeXZ0dC1maW5hbC1mYW50YXN5L3ZpdGUuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbm9lbGRhY29zdGEvY29kZS9mb3VuZHJ5dnR0LWZpbmFsLWZhbnRhc3kvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCByZXNvbHZlIGZyb20gXCJAcm9sbHVwL3BsdWdpbi1ub2RlLXJlc29sdmVcIjsgLy8gVGhpcyByZXNvbHZlcyBOUE0gbW9kdWxlcyBmcm9tIG5vZGVfbW9kdWxlcy5cbmltcG9ydCBwcmVwcm9jZXNzIGZyb20gXCJzdmVsdGUtcHJlcHJvY2Vzc1wiO1xuaW1wb3J0IHsgU1lTVEVNX0lELCBTWVNURU1fQ09ERSB9IGZyb20gXCIuL3NyYy9oZWxwZXJzL2NvbnN0YW50cy5qc1wiO1xuaW1wb3J0IHsgcG9zdGNzc0NvbmZpZywgdGVyc2VyQ29uZmlnLCB0eXBob25qc1J1bnRpbWUgfSBmcm9tIFwiQHR5cGhvbmpzLWZ2dHQvcnVudGltZS9yb2xsdXBcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuY29uc3Qgc19DT01QUkVTUyA9IGZhbHNlOyAvLyBTZXQgdG8gdHJ1ZSB0byBjb21wcmVzcyB0aGUgbW9kdWxlIGJ1bmRsZS5cbmNvbnN0IHNfU09VUkNFTUFQUyA9IHRydWU7IC8vIEdlbmVyYXRlIHNvdXJjZW1hcHMgZm9yIHRoZSBidW5kbGUgKHJlY29tbWVuZGVkKS5cblxuLy8gU2V0IHRvIHRydWUgdG8gZW5hYmxlIGxpbmtpbmcgYWdhaW5zdCB0aGUgVHlwaG9uSlMgUnVudGltZSBMaWJyYXJ5IG1vZHVsZS5cbi8vIFlvdSBtdXN0IGFkZCBhIEZvdW5kcnkgbW9kdWxlIGRlcGVuZGVuY3kgb24gdGhlIGB0eXBob25qc2AgRm91bmRyeSBwYWNrYWdlIG9yIG1hbnVhbGx5IGluc3RhbGwgaXQgaW4gRm91bmRyeSBmcm9tOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3R5cGhvbmpzLWZ2dHQtbGliL3R5cGhvbmpzL3JlbGVhc2VzL2xhdGVzdC9kb3dubG9hZC9tb2R1bGUuanNvblxuY29uc3Qgc19UWVBIT05KU19NT0RVTEVfTElCID0gZmFsc2U7XG5cbi8vIFVzZWQgaW4gYnVuZGxpbmcuXG5jb25zdCBzX1JFU09MVkVfQ09ORklHID0ge1xuICBicm93c2VyOiB0cnVlLFxuICBkZWR1cGU6IFtcInN2ZWx0ZVwiXSxcbn07XG5cbi8vIEFUVEVOVElPTiFcbi8vIFlvdSBtdXN0IGNoYW5nZSBgYmFzZWAgYW5kIHRoZSBgcHJveHlgIHN0cmluZ3MgcmVwbGFjaW5nIGAvc3lzdGVtcy8ke1NZU1RFTV9JRH0vYCB3aXRoIHlvdXJcbi8vIG1vZHVsZSBvciBzeXN0ZW0gSUQuXG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgLyoqIEB0eXBlIHtpbXBvcnQoJ3ZpdGUnKS5Vc2VyQ29uZmlnfSAqL1xuICByZXR1cm4ge1xuICAgIHJvb3Q6IFwic3JjL1wiLCAvLyBTb3VyY2UgbG9jYXRpb24gLyBlc2J1aWxkIHJvb3QuXG4gICAgYmFzZTogYC9zeXN0ZW1zLyR7U1lTVEVNX0lEfS9gLCAvLyBCYXNlIG1vZHVsZSBwYXRoIHRoYXQgMzAwMDEgLyBzZXJ2ZWQgZGV2IGRpcmVjdG9yeS5cbiAgICBwdWJsaWNEaXI6IGZhbHNlLCAvLyBObyBwdWJsaWMgcmVzb3VyY2VzIHRvIGNvcHkuXG4gICAgY2FjaGVEaXI6IFwiLi4vLnZpdGUtY2FjaGVcIiwgLy8gUmVsYXRpdmUgZnJvbSByb290IGRpcmVjdG9yeS5cblxuICAgIHRlc3Q6IHtcbiAgICAgIG1vY2tSZXNldDogdHJ1ZSxcbiAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgfSxcblxuICAgIHJlc29sdmU6IHtcbiAgICAgIGNvbmRpdGlvbnM6IFtcImltcG9ydFwiLCBcImJyb3dzZXJcIl0sXG4gICAgICBhbGlhczoge1xuICAgICAgICBcIn5cIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSksXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICBlc2J1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFtcImVzMjAyMlwiLCBcImNocm9tZTEwMFwiXSxcbiAgICAgIGtlZXBOYW1lczogdHJ1ZSwgLy8gTm90ZTogZG9lc24ndCBzZWVtIHRvIHdvcmsuXG4gICAgfSxcblxuICAgIGNzczoge1xuICAgICAgLy8gQ3JlYXRlcyBhIHN0YW5kYXJkIGNvbmZpZ3VyYXRpb24gZm9yIFBvc3RDU1Mgd2l0aCBhdXRvcHJlZml4ZXIgJiBwb3N0Y3NzLXByZXNldC1lbnYuXG4gICAgICBwb3N0Y3NzOiBwb3N0Y3NzQ29uZmlnKHsgY29tcHJlc3M6IHNfQ09NUFJFU1MsIHNvdXJjZU1hcDogc19TT1VSQ0VNQVBTIH0pLFxuICAgIH0sXG5cbiAgICAvLyBBYm91dCBzZXJ2ZXIgb3B0aW9uczpcbiAgICAvLyAtIFNldCB0byBgb3BlbmAgdG8gYm9vbGVhbiBgZmFsc2VgIHRvIG5vdCBvcGVuIGEgYnJvd3NlciB3aW5kb3cgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VmdWwgaWYgeW91IHNldCB1cCBhXG4gICAgLy8gZGVidWdnZXIgaW5zdGFuY2UgaW4geW91ciBJREUgYW5kIGxhdW5jaCBpdCB3aXRoIHRoZSBVUkw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAxL2dhbWUnLlxuICAgIC8vXG4gICAgLy8gLSBUaGUgdG9wIHByb3h5IGVudHJ5IGZvciBgbGFuZ2Agd2lsbCBwdWxsIHRoZSBsYW5ndWFnZSByZXNvdXJjZXMgZnJvbSB0aGUgbWFpbiBGb3VuZHJ5IC8gMzAwMDAgc2VydmVyLiBUaGlzXG4gICAgLy8gaXMgbmVjZXNzYXJ5IHRvIHJlZmVyZW5jZSB0aGUgZGV2IHJlc291cmNlcyBhcyB0aGUgcm9vdCBpcyBgL3NyY2AgYW5kIHRoZXJlIGlzIG5vIHB1YmxpYyAvIHN0YXRpYyByZXNvdXJjZXNcbiAgICAvLyBzZXJ2ZWQuXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwMSxcbiAgICAgIC8vIG9wZW46IFwiL2dhbWVcIixcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgW2BeKC9zeXN0ZW1zLyR7U1lTVEVNX0lEfS8obGFuZ3xwYWNrc3xhc3NldHMpKWBdOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDBcIixcbiAgICAgICAgW2BeKC9zeXN0ZW1zLyR7U1lTVEVNX0lEfS9zdHlsZS5jc3MpYF06IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwMFwiLFxuICAgICAgICBbYF4oPyEvc3lzdGVtcy8ke1NZU1RFTV9JRH0vKWBdOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDBcIixcbiAgICAgICAgXCIvc29ja2V0LmlvXCI6IHsgdGFyZ2V0OiBcIndzOi8vbG9jYWxob3N0OjMwMDAwXCIsIHdzOiB0cnVlIH1cbiAgICAgIH0sXG4gICAgfSxcblxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IF9fZGlybmFtZSxcbiAgICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICAgIHNvdXJjZW1hcDogc19TT1VSQ0VNQVBTLFxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgIG1pbmlmeTogc19DT01QUkVTUyA/IFwidGVyc2VyXCIgOiBmYWxzZSxcbiAgICAgIHRhcmdldDogW1wiZXMyMDIyXCIsIFwiY2hyb21lMTAwXCJdLFxuICAgICAgdGVyc2VyT3B0aW9uczogc19DT01QUkVTUyA/IHsgLi4udGVyc2VyQ29uZmlnKCksIGVjbWE6IDIwMjIgfSA6IHZvaWQgMCxcbiAgICAgIGxpYjoge1xuICAgICAgICBlbnRyeTogXCIuL2luZGV4LmpzXCIsXG4gICAgICAgIGZvcm1hdHM6IFtcImVzXCJdLFxuICAgICAgICBmaWxlTmFtZTogXCJpbmRleFwiLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgcGx1Z2luczogW1xuICAgICAgc3ZlbHRlKHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgLy8gUHJvdmlkZXMgYSBjdXN0b20gaGFzaCBhZGRpbmcgdGhlIHN0cmluZyBkZWZpbmVkIGluIGBzX1NWRUxURV9IQVNIX0lEYCB0byBzY29wZWQgU3ZlbHRlIHN0eWxlcztcbiAgICAgICAgICAvLyBUaGlzIGlzIHJlYXNvbmFibGUgdG8gZG8gYXMgdGhlIGZyYW1ld29yayBzdHlsZXMgaW4gVFJMIGNvbXBpbGVkIGFjcm9zcyBgbmAgZGlmZmVyZW50IHBhY2thZ2VzIHdpbGxcbiAgICAgICAgICAvLyBiZSB0aGUgc2FtZS4gU2xpZ2h0bHkgbW9kaWZ5aW5nIHRoZSBoYXNoIGVuc3VyZXMgdGhhdCB5b3VyIHBhY2thZ2UgaGFzIHVuaXF1ZWx5IHNjb3BlZCBzdHlsZXMgZm9yIGFsbFxuICAgICAgICAgIC8vIFRSTCBjb21wb25lbnRzIGFuZCBtYWtlcyBpdCBlYXNpZXIgdG8gcmV2aWV3IHN0eWxlcyBpbiB0aGUgYnJvd3NlciBkZWJ1Z2dlci5cbiAgICAgICAgICBjc3NIYXNoOiAoeyBoYXNoLCBjc3MgfSkgPT4gYHN2ZWx0ZS0ke1NZU1RFTV9DT0RFfS0ke2hhc2goY3NzKX1gXG4gICAgICAgfSxcbiAgICAgICAgcHJlcHJvY2VzczogcHJlcHJvY2VzcygpLFxuICAgICAgICBvbndhcm46ICh3YXJuaW5nLCBoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgLy8gU3VwcHJlc3MgYGExMXktbWlzc2luZy1hdHRyaWJ1dGVgIGZvciBtaXNzaW5nIGhyZWYgaW4gPGE+IGxpbmtzLlxuICAgICAgICAgIC8vIEZvdW5kcnkgZG9lc24ndCBmb2xsb3cgYWNjZXNzaWJpbGl0eSBydWxlcy5cbiAgICAgICAgICBpZiAod2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKGA8YT4gZWxlbWVudCBzaG91bGQgaGF2ZSBhbiBocmVmIGF0dHJpYnV0ZWApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTGV0IFJvbGx1cCBoYW5kbGUgYWxsIG90aGVyIHdhcm5pbmdzIG5vcm1hbGx5LlxuICAgICAgICAgIGhhbmRsZXIod2FybmluZyk7XG4gICAgICAgIH0sXG4gICAgICB9KSxcblxuICAgICAgcmVzb2x2ZShzX1JFU09MVkVfQ09ORklHKSwgLy8gTmVjZXNzYXJ5IHdoZW4gYnVuZGxpbmcgbnBtLWxpbmtlZCBwYWNrYWdlcy5cblxuICAgICAgLy8gV2hlbiBzX1RZUEhPTkpTX01PRFVMRV9MSUIgaXMgdHJ1ZSB0cmFuc3BpbGUgYWdhaW5zdCB0aGUgRm91bmRyeSBtb2R1bGUgdmVyc2lvbiBvZiBUUkwuXG4gICAgICBzX1RZUEhPTkpTX01PRFVMRV9MSUIgJiYgdHlwaG9uanNSdW50aW1lKCksXG4gICAgXSxcbiAgfTtcbn07XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL25vZWxkYWNvc3RhL2NvZGUvZm91bmRyeXZ0dC1maW5hbC1mYW50YXN5L3NyYy9oZWxwZXJzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbm9lbGRhY29zdGEvY29kZS9mb3VuZHJ5dnR0LWZpbmFsLWZhbnRhc3kvc3JjL2hlbHBlcnMvY29uc3RhbnRzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9ub2VsZGFjb3N0YS9jb2RlL2ZvdW5kcnl2dHQtZmluYWwtZmFudGFzeS9zcmMvaGVscGVycy9jb25zdGFudHMuanNcIjtleHBvcnQgY29uc3QgU1lTVEVNX0lEID0gJ2ZvdW5kcnl2dHQtZmluYWwtZmFudGFzeSc7XG5leHBvcnQgY29uc3QgU1lTVEVNX0NPREUgPSAnRkYxNSc7XG5leHBvcnQgY29uc3QgTE9HX1BSRUZJWCA9IGAke1NZU1RFTV9DT0RFfSB8YDtcbmV4cG9ydCBjb25zdCBBU1NFVF9QQVRIID0gYHN5c3RlbXMvJHtTWVNURU1fSUR9L2Fzc2V0c2A7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9VLFNBQVMsY0FBYztBQUMzVixPQUFPLGFBQWE7QUFDcEIsT0FBTyxnQkFBZ0I7OztBQ0ZrVixJQUFNLFlBQVk7QUFDcFgsSUFBTSxjQUFjO0FBQ3BCLElBQU0sYUFBYSxHQUFHLFdBQVc7QUFDakMsSUFBTSxhQUFhLFdBQVcsU0FBUzs7O0FEQzlDLFNBQVMsZUFBZSxjQUFjLHVCQUF1QjtBQUM3RCxZQUFZLFVBQVU7QUFMdEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTSxhQUFhO0FBQ25CLElBQU0sZUFBZTtBQUtyQixJQUFNLHdCQUF3QjtBQUc5QixJQUFNLG1CQUFtQjtBQUFBLEVBQ3ZCLFNBQVM7QUFBQSxFQUNULFFBQVEsQ0FBQyxRQUFRO0FBQ25CO0FBTUEsSUFBTyxzQkFBUSxNQUFNO0FBRW5CLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTSxZQUFZLFNBQVM7QUFBQTtBQUFBLElBQzNCLFdBQVc7QUFBQTtBQUFBLElBQ1gsVUFBVTtBQUFBO0FBQUEsSUFFVixNQUFNO0FBQUEsTUFDSixXQUFXO0FBQUEsTUFDWCxTQUFTO0FBQUEsSUFDWDtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsWUFBWSxDQUFDLFVBQVUsU0FBUztBQUFBLE1BQ2hDLE9BQU87QUFBQSxRQUNMLEtBQVUsYUFBUSxnQ0FBUztBQUFBLE1BQzdCO0FBQUEsSUFDRjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsUUFBUSxDQUFDLFVBQVUsV0FBVztBQUFBLE1BQzlCLFdBQVc7QUFBQTtBQUFBLElBQ2I7QUFBQSxJQUVBLEtBQUs7QUFBQTtBQUFBLE1BRUgsU0FBUyxjQUFjLEVBQUUsVUFBVSxZQUFZLFdBQVcsYUFBYSxDQUFDO0FBQUEsSUFDMUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBU0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFFTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxDQUFDLGNBQWMsU0FBUyx1QkFBdUIsR0FBRztBQUFBLFFBQ2xELENBQUMsY0FBYyxTQUFTLGFBQWEsR0FBRztBQUFBLFFBQ3hDLENBQUMsZ0JBQWdCLFNBQVMsSUFBSSxHQUFHO0FBQUEsUUFDakMsY0FBYyxFQUFFLFFBQVEsd0JBQXdCLElBQUksS0FBSztBQUFBLE1BQzNEO0FBQUEsSUFDRjtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsWUFBWTtBQUFBLE1BQ1osUUFBUSxhQUFhLFdBQVc7QUFBQSxNQUNoQyxRQUFRLENBQUMsVUFBVSxXQUFXO0FBQUEsTUFDOUIsZUFBZSxhQUFhLEVBQUUsR0FBRyxhQUFhLEdBQUcsTUFBTSxLQUFLLElBQUk7QUFBQSxNQUNoRSxLQUFLO0FBQUEsUUFDSCxPQUFPO0FBQUEsUUFDUCxTQUFTLENBQUMsSUFBSTtBQUFBLFFBQ2QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsSUFFQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxpQkFBaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS2YsU0FBUyxDQUFDLEVBQUUsTUFBTSxJQUFJLE1BQU0sVUFBVSxXQUFXLElBQUksS0FBSyxHQUFHLENBQUM7QUFBQSxRQUNqRTtBQUFBLFFBQ0MsWUFBWSxXQUFXO0FBQUEsUUFDdkIsUUFBUSxDQUFDLFNBQVMsWUFBWTtBQUc1QixjQUFJLFFBQVEsUUFBUSxTQUFTLDJDQUEyQyxHQUFHO0FBQ3pFO0FBQUEsVUFDRjtBQUdBLGtCQUFRLE9BQU87QUFBQSxRQUNqQjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BRUQsUUFBUSxnQkFBZ0I7QUFBQTtBQUFBO0FBQUEsTUFHeEIseUJBQXlCLGdCQUFnQjtBQUFBLElBQzNDO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
