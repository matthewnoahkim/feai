"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/../../node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/../../node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/../../node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_matth_New_folder_4_feai_packages_frontend_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\matth\\\\New folder (4)\\\\feai\\\\packages\\\\frontend\\\\src\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_matth_New_folder_4_feai_packages_frontend_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1hcHAtbG9hZGVyLmpzP25hbWU9YXBwJTJGYXBpJTJGYXV0aCUyRiU1Qi4uLm5leHRhdXRoJTVEJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZS50cyZhcHBEaXI9QyUzQSU1Q1VzZXJzJTVDbWF0dGglNUNOZXclMjBmb2xkZXIlMjAoNCklNUNmZWFpJTVDcGFja2FnZXMlNUNmcm9udGVuZCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDbWF0dGglNUNOZXclMjBmb2xkZXIlMjAoNCklNUNmZWFpJTVDcGFja2FnZXMlNUNmcm9udGVuZCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDd0Q7QUFDckk7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmVhaS9mcm9udGVuZC8/NTYyYSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxtYXR0aFxcXFxOZXcgZm9sZGVyICg0KVxcXFxmZWFpXFxcXHBhY2thZ2VzXFxcXGZyb250ZW5kXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcWy4uLm5leHRhdXRoXVxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxtYXR0aFxcXFxOZXcgZm9sZGVyICg0KVxcXFxmZWFpXFxcXHBhY2thZ2VzXFxcXGZyb250ZW5kXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcWy4uLm5leHRhdXRoXVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/../../node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBaUM7QUFDUTtBQUV6QyxNQUFNRSxVQUFVRixnREFBUUEsQ0FBQ0Msa0RBQVdBO0FBRU8iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmVhaS9mcm9udGVuZC8uL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz8wMDk4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tICduZXh0LWF1dGgnO1xyXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnO1xyXG5cclxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcclxuXHJcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcclxuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/../../node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/../../node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./src/lib/prisma.ts\");\n\n\n\n// Use a stable secret for development if NEXTAUTH_SECRET is not set\nconst getSecret = ()=>{\n    if (process.env.NEXTAUTH_SECRET) {\n        return process.env.NEXTAUTH_SECRET;\n    }\n    // Fallback secret for development - DO NOT use in production\n    if (true) {\n        return \"feai-development-secret-key-do-not-use-in-production-12345\";\n    }\n    throw new Error(\"NEXTAUTH_SECRET must be set in production\");\n};\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    // Explicitly set the secret to prevent session issues\n    secret: getSecret(),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    session: {\n        strategy: \"jwt\",\n        // Extend session max age to 30 days\n        maxAge: 30 * 24 * 60 * 60\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    callbacks: {\n        async redirect ({ url, baseUrl }) {\n            // Force error redirects to /login on same origin (avoids /api/auth/error 404 on some hosts)\n            if (url.startsWith(baseUrl + \"/api/auth/error\")) {\n                const parsed = new URL(url);\n                const error = parsed.searchParams.get(\"error\");\n                return error ? `${baseUrl}/login?error=${error}` : `${baseUrl}/login`;\n            }\n            // After successful sign-in, never send users to the login page — send to dashboard\n            const loginPath = baseUrl + \"/login\";\n            if (url === loginPath || url.startsWith(loginPath + \"?\")) {\n                return baseUrl + \"/dashboard\";\n            }\n            return url.startsWith(baseUrl) ? url : baseUrl;\n        },\n        async signIn ({ user, account, profile }) {\n            if (!user.email) {\n                return false;\n            }\n            // Check if user already exists\n            const existingUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                where: {\n                    email: user.email\n                },\n                include: {\n                    accounts: true\n                }\n            });\n            if (existingUser) {\n                // Check if this provider is already linked\n                const existingAccount = existingUser.accounts.find((acc)=>acc.provider === account?.provider);\n                if (!existingAccount && account) {\n                    // Link new provider account to existing user\n                    await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.account.create({\n                        data: {\n                            userId: existingUser.id,\n                            type: account.type,\n                            provider: account.provider,\n                            providerAccountId: account.providerAccountId,\n                            refresh_token: account.refresh_token,\n                            access_token: account.access_token,\n                            expires_at: account.expires_at,\n                            token_type: account.token_type,\n                            scope: account.scope,\n                            id_token: account.id_token,\n                            session_state: account.session_state\n                        }\n                    });\n                }\n            }\n            return true;\n        },\n        async jwt ({ token, user, account }) {\n            // Initial sign in\n            if (user) {\n                token.sub = user.id;\n            }\n            // Fetch latest user data from database on subsequent requests\n            if (token.sub) {\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        id: token.sub\n                    },\n                    select: {\n                        id: true,\n                        name: true,\n                        email: true,\n                        image: true\n                    }\n                });\n                if (dbUser) {\n                    token.name = dbUser.name;\n                    token.email = dbUser.email;\n                    token.picture = dbUser.image;\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token.sub && session.user) {\n                session.user.id = token.sub;\n                // Fetch latest user data from database\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        id: token.sub\n                    },\n                    select: {\n                        id: true,\n                        name: true,\n                        email: true,\n                        image: true\n                    }\n                });\n                if (dbUser) {\n                    session.user.name = dbUser.name;\n                    session.user.email = dbUser.email;\n                    session.user.image = dbUser.image;\n                }\n            }\n            return session;\n        }\n    },\n    events: {\n        async createUser ({ user }) {\n            console.log(\"New user created:\", user.email);\n        }\n    },\n    // Only enable debug in development when explicitly requested\n    debug: process.env.NEXTAUTH_DEBUG === \"true\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLEdBQUdGLE9BQU9FLElBQUk7b0JBQy9CL0MsUUFBUWdCLElBQUksQ0FBQ0csS0FBSyxHQUFHMEIsT0FBTzFCLEtBQUs7b0JBQ2pDbkIsUUFBUWdCLElBQUksQ0FBQ2dDLEtBQUssR0FBR0gsT0FBT0csS0FBSztnQkFDbkM7WUFDRjtZQUVBLE9BQU9oRDtRQUNUO0lBQ0Y7SUFFQWtELFFBQVE7UUFDTixNQUFNQyxZQUFXLEVBQUVuQyxJQUFJLEVBQUU7WUFDdkJvQyxRQUFRQyxHQUFHLENBQUMscUJBQXFCckMsS0FBS0csS0FBSztRQUM3QztJQUNGO0lBRUEsNkRBQTZEO0lBQzdEbUMsT0FBT25FLFFBQVFDLEdBQUcsQ0FBQ21FLGNBQWMsS0FBSztBQUN4QyxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGZlYWkvZnJvbnRlbmQvLi9zcmMvbGliL2F1dGgudHM/NjY5MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tICduZXh0LWF1dGgnO1xyXG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGUnO1xyXG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSAnQGF1dGgvcHJpc21hLWFkYXB0ZXInO1xyXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICcuL3ByaXNtYSc7XHJcblxyXG4vLyBVc2UgYSBzdGFibGUgc2VjcmV0IGZvciBkZXZlbG9wbWVudCBpZiBORVhUQVVUSF9TRUNSRVQgaXMgbm90IHNldFxyXG5jb25zdCBnZXRTZWNyZXQgPSAoKSA9PiB7XHJcbiAgaWYgKHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCkge1xyXG4gICAgcmV0dXJuIHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVDtcclxuICB9XHJcbiAgLy8gRmFsbGJhY2sgc2VjcmV0IGZvciBkZXZlbG9wbWVudCAtIERPIE5PVCB1c2UgaW4gcHJvZHVjdGlvblxyXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgcmV0dXJuICdmZWFpLWRldmVsb3BtZW50LXNlY3JldC1rZXktZG8tbm90LXVzZS1pbi1wcm9kdWN0aW9uLTEyMzQ1JztcclxuICB9XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdORVhUQVVUSF9TRUNSRVQgbXVzdCBiZSBzZXQgaW4gcHJvZHVjdGlvbicpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XHJcbiAgYWRhcHRlcjogUHJpc21hQWRhcHRlcihwcmlzbWEpIGFzIE5leHRBdXRoT3B0aW9uc1snYWRhcHRlciddLFxyXG5cclxuICAvLyBFeHBsaWNpdGx5IHNldCB0aGUgc2VjcmV0IHRvIHByZXZlbnQgc2Vzc2lvbiBpc3N1ZXNcclxuICBzZWNyZXQ6IGdldFNlY3JldCgpLFxyXG5cclxuICBwcm92aWRlcnM6IFtcclxuICAgIEdvb2dsZVByb3ZpZGVyKHtcclxuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQhLFxyXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUISxcclxuICAgICAgYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nOiB0cnVlLFxyXG4gICAgfSksXHJcbiAgXSxcclxuXHJcbiAgc2Vzc2lvbjoge1xyXG4gICAgc3RyYXRlZ3k6ICdqd3QnLFxyXG4gICAgLy8gRXh0ZW5kIHNlc3Npb24gbWF4IGFnZSB0byAzMCBkYXlzXHJcbiAgICBtYXhBZ2U6IDMwICogMjQgKiA2MCAqIDYwLCAvLyAzMCBkYXlzXHJcbiAgfSxcclxuXHJcbiAgcGFnZXM6IHtcclxuICAgIHNpZ25JbjogJy9sb2dpbicsXHJcbiAgICBlcnJvcjogJy9sb2dpbicsXHJcbiAgfSxcclxuXHJcbiAgY2FsbGJhY2tzOiB7XHJcbiAgICBhc3luYyByZWRpcmVjdCh7IHVybCwgYmFzZVVybCB9KSB7XHJcbiAgICAgIC8vIEZvcmNlIGVycm9yIHJlZGlyZWN0cyB0byAvbG9naW4gb24gc2FtZSBvcmlnaW4gKGF2b2lkcyAvYXBpL2F1dGgvZXJyb3IgNDA0IG9uIHNvbWUgaG9zdHMpXHJcbiAgICAgIGlmICh1cmwuc3RhcnRzV2l0aChiYXNlVXJsICsgJy9hcGkvYXV0aC9lcnJvcicpKSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gcGFyc2VkLnNlYXJjaFBhcmFtcy5nZXQoJ2Vycm9yJyk7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yID8gYCR7YmFzZVVybH0vbG9naW4/ZXJyb3I9JHtlcnJvcn1gIDogYCR7YmFzZVVybH0vbG9naW5gO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEFmdGVyIHN1Y2Nlc3NmdWwgc2lnbi1pbiwgbmV2ZXIgc2VuZCB1c2VycyB0byB0aGUgbG9naW4gcGFnZSDigJQgc2VuZCB0byBkYXNoYm9hcmRcclxuICAgICAgY29uc3QgbG9naW5QYXRoID0gYmFzZVVybCArICcvbG9naW4nO1xyXG4gICAgICBpZiAodXJsID09PSBsb2dpblBhdGggfHwgdXJsLnN0YXJ0c1dpdGgobG9naW5QYXRoICsgJz8nKSkge1xyXG4gICAgICAgIHJldHVybiBiYXNlVXJsICsgJy9kYXNoYm9hcmQnO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB1cmwuc3RhcnRzV2l0aChiYXNlVXJsKSA/IHVybCA6IGJhc2VVcmw7XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xyXG4gICAgICBpZiAoIXVzZXIuZW1haWwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHVzZXIgYWxyZWFkeSBleGlzdHNcclxuICAgICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgd2hlcmU6IHsgZW1haWw6IHVzZXIuZW1haWwgfSxcclxuICAgICAgICBpbmNsdWRlOiB7IGFjY291bnRzOiB0cnVlIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGV4aXN0aW5nVXNlcikge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgcHJvdmlkZXIgaXMgYWxyZWFkeSBsaW5rZWRcclxuICAgICAgICBjb25zdCBleGlzdGluZ0FjY291bnQgPSBleGlzdGluZ1VzZXIuYWNjb3VudHMuZmluZChcclxuICAgICAgICAgIChhY2MpID0+IGFjYy5wcm92aWRlciA9PT0gYWNjb3VudD8ucHJvdmlkZXJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWV4aXN0aW5nQWNjb3VudCAmJiBhY2NvdW50KSB7XHJcbiAgICAgICAgICAvLyBMaW5rIG5ldyBwcm92aWRlciBhY2NvdW50IHRvIGV4aXN0aW5nIHVzZXJcclxuICAgICAgICAgIGF3YWl0IHByaXNtYS5hY2NvdW50LmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICB1c2VySWQ6IGV4aXN0aW5nVXNlci5pZCxcclxuICAgICAgICAgICAgICB0eXBlOiBhY2NvdW50LnR5cGUsXHJcbiAgICAgICAgICAgICAgcHJvdmlkZXI6IGFjY291bnQucHJvdmlkZXIsXHJcbiAgICAgICAgICAgICAgcHJvdmlkZXJBY2NvdW50SWQ6IGFjY291bnQucHJvdmlkZXJBY2NvdW50SWQsXHJcbiAgICAgICAgICAgICAgcmVmcmVzaF90b2tlbjogYWNjb3VudC5yZWZyZXNoX3Rva2VuLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgICAgZXhwaXJlc19hdDogYWNjb3VudC5leHBpcmVzX2F0LFxyXG4gICAgICAgICAgICAgIHRva2VuX3R5cGU6IGFjY291bnQudG9rZW5fdHlwZSxcclxuICAgICAgICAgICAgICBzY29wZTogYWNjb3VudC5zY29wZSxcclxuICAgICAgICAgICAgICBpZF90b2tlbjogYWNjb3VudC5pZF90b2tlbixcclxuICAgICAgICAgICAgICBzZXNzaW9uX3N0YXRlOiBhY2NvdW50LnNlc3Npb25fc3RhdGUgYXMgc3RyaW5nIHwgbnVsbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyLCBhY2NvdW50IH0pIHtcclxuICAgICAgLy8gSW5pdGlhbCBzaWduIGluXHJcbiAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgdG9rZW4uc3ViID0gdXNlci5pZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggbGF0ZXN0IHVzZXIgZGF0YSBmcm9tIGRhdGFiYXNlIG9uIHN1YnNlcXVlbnQgcmVxdWVzdHNcclxuICAgICAgaWYgKHRva2VuLnN1Yikge1xyXG4gICAgICAgIGNvbnN0IGRiVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IHRva2VuLnN1YiB9LFxyXG4gICAgICAgICAgc2VsZWN0OiB7XHJcbiAgICAgICAgICAgIGlkOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxyXG4gICAgICAgICAgICBlbWFpbDogdHJ1ZSxcclxuICAgICAgICAgICAgaW1hZ2U6IHRydWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoZGJVc2VyKSB7XHJcbiAgICAgICAgICB0b2tlbi5uYW1lID0gZGJVc2VyLm5hbWU7XHJcbiAgICAgICAgICB0b2tlbi5lbWFpbCA9IGRiVXNlci5lbWFpbDtcclxuICAgICAgICAgIHRva2VuLnBpY3R1cmUgPSBkYlVzZXIuaW1hZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdG9rZW47XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XHJcbiAgICAgIGlmICh0b2tlbi5zdWIgJiYgc2Vzc2lvbi51c2VyKSB7XHJcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uc3ViO1xyXG5cclxuICAgICAgICAvLyBGZXRjaCBsYXRlc3QgdXNlciBkYXRhIGZyb20gZGF0YWJhc2VcclxuICAgICAgICBjb25zdCBkYlVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGlkOiB0b2tlbi5zdWIgfSxcclxuICAgICAgICAgIHNlbGVjdDoge1xyXG4gICAgICAgICAgICBpZDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgZW1haWw6IHRydWUsXHJcbiAgICAgICAgICAgIGltYWdlOiB0cnVlLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGRiVXNlcikge1xyXG4gICAgICAgICAgc2Vzc2lvbi51c2VyLm5hbWUgPSBkYlVzZXIubmFtZTtcclxuICAgICAgICAgIHNlc3Npb24udXNlci5lbWFpbCA9IGRiVXNlci5lbWFpbDtcclxuICAgICAgICAgIHNlc3Npb24udXNlci5pbWFnZSA9IGRiVXNlci5pbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzZXNzaW9uO1xyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBldmVudHM6IHtcclxuICAgIGFzeW5jIGNyZWF0ZVVzZXIoeyB1c2VyIH0pIHtcclxuICAgICAgY29uc29sZS5sb2coJ05ldyB1c2VyIGNyZWF0ZWQ6JywgdXNlci5lbWFpbCk7XHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIE9ubHkgZW5hYmxlIGRlYnVnIGluIGRldmVsb3BtZW50IHdoZW4gZXhwbGljaXRseSByZXF1ZXN0ZWRcclxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfREVCVUcgPT09ICd0cnVlJyxcclxufTtcclxuIl0sIm5hbWVzIjpbIkdvb2dsZVByb3ZpZGVyIiwiUHJpc21hQWRhcHRlciIsInByaXNtYSIsImdldFNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiLCJFcnJvciIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInNlY3JldCIsInByb3ZpZGVycyIsImNsaWVudElkIiwiR09PR0xFX0NMSUVOVF9JRCIsImNsaWVudFNlY3JldCIsIkdPT0dMRV9DTElFTlRfU0VDUkVUIiwiYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwibWF4QWdlIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciIsImNhbGxiYWNrcyIsInJlZGlyZWN0IiwidXJsIiwiYmFzZVVybCIsInN0YXJ0c1dpdGgiLCJwYXJzZWQiLCJVUkwiLCJzZWFyY2hQYXJhbXMiLCJnZXQiLCJsb2dpblBhdGgiLCJ1c2VyIiwiYWNjb3VudCIsInByb2ZpbGUiLCJlbWFpbCIsImV4aXN0aW5nVXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImluY2x1ZGUiLCJhY2NvdW50cyIsImV4aXN0aW5nQWNjb3VudCIsImZpbmQiLCJhY2MiLCJwcm92aWRlciIsImNyZWF0ZSIsImRhdGEiLCJ1c2VySWQiLCJpZCIsInR5cGUiLCJwcm92aWRlckFjY291bnRJZCIsInJlZnJlc2hfdG9rZW4iLCJhY2Nlc3NfdG9rZW4iLCJleHBpcmVzX2F0IiwidG9rZW5fdHlwZSIsInNjb3BlIiwiaWRfdG9rZW4iLCJzZXNzaW9uX3N0YXRlIiwiand0IiwidG9rZW4iLCJzdWIiLCJkYlVzZXIiLCJzZWxlY3QiLCJuYW1lIiwiaW1hZ2UiLCJwaWN0dXJlIiwiZXZlbnRzIiwiY3JlYXRlVXNlciIsImNvbnNvbGUiLCJsb2ciLCJkZWJ1ZyIsIk5FWFRBVVRIX0RFQlVHIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        \"query\",\n        \"error\",\n        \"warn\"\n    ] : 0\n});\nif (true) {\n    globalForPrisma.prisma = prisma;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBOEM7QUFFOUMsTUFBTUMsa0JBQWtCQztBQUlqQixNQUFNQyxTQUNYRixnQkFBZ0JFLE1BQU0sSUFDdEIsSUFBSUgsd0RBQVlBLENBQUM7SUFDZkksS0FBS0MsS0FBeUIsR0FBZ0I7UUFBQztRQUFTO1FBQVM7S0FBTyxHQUFHLENBQVM7QUFDdEYsR0FBRztBQUVMLElBQUlBLElBQXlCLEVBQWM7SUFDekNKLGdCQUFnQkUsTUFBTSxHQUFHQTtBQUMzQiIsInNvdXJjZXMiOlsid2VicGFjazovL0BmZWFpL2Zyb250ZW5kLy4vc3JjL2xpYi9wcmlzbWEudHM/MDFkNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XHJcblxyXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xyXG4gIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHByaXNtYSA9XHJcbiAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xyXG4gIG5ldyBQcmlzbWFDbGllbnQoe1xyXG4gICAgbG9nOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IFsncXVlcnknLCAnZXJyb3InLCAnd2FybiddIDogWydlcnJvciddLFxyXG4gIH0pO1xyXG5cclxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcclxuICBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/@auth","vendor-chunks/preact","vendor-chunks/cookie","vendor-chunks/preact-render-to-string","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();