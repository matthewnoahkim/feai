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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/../../node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth/index.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBaUM7QUFDUTtBQUV6QyxNQUFNRSxVQUFVRixnREFBUUEsQ0FBQ0Msa0RBQVdBO0FBRU8iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmVhaS9mcm9udGVuZC8uL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz8wMDk4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tICduZXh0LWF1dGgnO1xyXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnO1xyXG5cclxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcclxuXHJcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcclxuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth/config.ts":
/*!********************************!*\
  !*** ./src/lib/auth/config.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/../../node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/../../node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../prisma */ \"(rsc)/./src/lib/prisma.ts\");\n\n\n\nconst getSecret = ()=>{\n    if (process.env.NEXTAUTH_SECRET) {\n        return process.env.NEXTAUTH_SECRET;\n    }\n    if (true) {\n        return \"feai-development-secret-key-do-not-use-in-production-12345\";\n    }\n    throw new Error(\"NEXTAUTH_SECRET must be set in production\");\n};\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    secret: getSecret(),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    callbacks: {\n        async redirect ({ url, baseUrl }) {\n            if (url.startsWith(baseUrl + \"/api/auth/error\")) {\n                const parsed = new URL(url);\n                const error = parsed.searchParams.get(\"error\");\n                return error ? `${baseUrl}/login?error=${error}` : `${baseUrl}/login`;\n            }\n            const loginPath = baseUrl + \"/login\";\n            if (url === loginPath || url.startsWith(loginPath + \"?\")) {\n                return baseUrl + \"/dashboard\";\n            }\n            return url.startsWith(baseUrl) ? url : baseUrl;\n        },\n        async signIn ({ user, account, profile }) {\n            if (!user.email) {\n                return false;\n            }\n            const existingUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                where: {\n                    email: user.email\n                },\n                include: {\n                    accounts: true\n                }\n            });\n            if (existingUser) {\n                const existingAccount = existingUser.accounts.find((acc)=>acc.provider === account?.provider);\n                if (!existingAccount && account) {\n                    await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.account.create({\n                        data: {\n                            userId: existingUser.id,\n                            type: account.type,\n                            provider: account.provider,\n                            providerAccountId: account.providerAccountId,\n                            refresh_token: account.refresh_token,\n                            access_token: account.access_token,\n                            expires_at: account.expires_at,\n                            token_type: account.token_type,\n                            scope: account.scope,\n                            id_token: account.id_token,\n                            session_state: account.session_state\n                        }\n                    });\n                }\n            }\n            return true;\n        },\n        async jwt ({ token, user, account }) {\n            if (user) {\n                token.sub = user.id;\n            }\n            if (token.sub) {\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        id: token.sub\n                    },\n                    select: {\n                        id: true,\n                        name: true,\n                        email: true,\n                        image: true\n                    }\n                });\n                if (dbUser) {\n                    token.name = dbUser.name;\n                    token.email = dbUser.email;\n                    token.picture = dbUser.image;\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token.sub && session.user) {\n                session.user.id = token.sub;\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        id: token.sub\n                    },\n                    select: {\n                        id: true,\n                        name: true,\n                        email: true,\n                        image: true\n                    }\n                });\n                if (dbUser) {\n                    session.user.name = dbUser.name;\n                    session.user.email = dbUser.email;\n                    session.user.image = dbUser.image;\n                }\n            }\n            return session;\n        }\n    },\n    debug: process.env.NEXTAUTH_DEBUG === \"true\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNGO0lBRUFrRCxPQUFPL0QsUUFBUUMsR0FBRyxDQUFDK0QsY0FBYyxLQUFLO0FBQ3hDLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmVhaS9mcm9udGVuZC8uL3NyYy9saWIvYXV0aC9jb25maWcudHM/N2UzMSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tICduZXh0LWF1dGgnO1xyXG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGUnO1xyXG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSAnQGF1dGgvcHJpc21hLWFkYXB0ZXInO1xyXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICcuLi9wcmlzbWEnO1xyXG5cclxuY29uc3QgZ2V0U2VjcmV0ID0gKCkgPT4ge1xyXG4gIGlmIChwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQpIHtcclxuICAgIHJldHVybiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQ7XHJcbiAgfVxyXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgcmV0dXJuICdmZWFpLWRldmVsb3BtZW50LXNlY3JldC1rZXktZG8tbm90LXVzZS1pbi1wcm9kdWN0aW9uLTEyMzQ1JztcclxuICB9XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdORVhUQVVUSF9TRUNSRVQgbXVzdCBiZSBzZXQgaW4gcHJvZHVjdGlvbicpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XHJcbiAgYWRhcHRlcjogUHJpc21hQWRhcHRlcihwcmlzbWEpIGFzIE5leHRBdXRoT3B0aW9uc1snYWRhcHRlciddLFxyXG4gIHNlY3JldDogZ2V0U2VjcmV0KCksXHJcblxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgR29vZ2xlUHJvdmlkZXIoe1xyXG4gICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCEsXHJcbiAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQhLFxyXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXHJcbiAgICB9KSxcclxuICBdLFxyXG5cclxuICBzZXNzaW9uOiB7XHJcbiAgICBzdHJhdGVneTogJ2p3dCcsXHJcbiAgICBtYXhBZ2U6IDMwICogMjQgKiA2MCAqIDYwLFxyXG4gIH0sXHJcblxyXG4gIHBhZ2VzOiB7XHJcbiAgICBzaWduSW46ICcvbG9naW4nLFxyXG4gICAgZXJyb3I6ICcvbG9naW4nLFxyXG4gIH0sXHJcblxyXG4gIGNhbGxiYWNrczoge1xyXG4gICAgYXN5bmMgcmVkaXJlY3QoeyB1cmwsIGJhc2VVcmwgfSkge1xyXG4gICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoYmFzZVVybCArICcvYXBpL2F1dGgvZXJyb3InKSkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcclxuICAgICAgICBjb25zdCBlcnJvciA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0KCdlcnJvcicpO1xyXG4gICAgICAgIHJldHVybiBlcnJvciA/IGAke2Jhc2VVcmx9L2xvZ2luP2Vycm9yPSR7ZXJyb3J9YCA6IGAke2Jhc2VVcmx9L2xvZ2luYDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBsb2dpblBhdGggPSBiYXNlVXJsICsgJy9sb2dpbic7XHJcbiAgICAgIGlmICh1cmwgPT09IGxvZ2luUGF0aCB8fCB1cmwuc3RhcnRzV2l0aChsb2dpblBhdGggKyAnPycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2VVcmwgKyAnL2Rhc2hib2FyZCc7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHVybC5zdGFydHNXaXRoKGJhc2VVcmwpID8gdXJsIDogYmFzZVVybDtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgc2lnbkluKHsgdXNlciwgYWNjb3VudCwgcHJvZmlsZSB9KSB7XHJcbiAgICAgIGlmICghdXNlci5lbWFpbCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgd2hlcmU6IHsgZW1haWw6IHVzZXIuZW1haWwgfSxcclxuICAgICAgICBpbmNsdWRlOiB7IGFjY291bnRzOiB0cnVlIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGV4aXN0aW5nVXNlcikge1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nQWNjb3VudCA9IGV4aXN0aW5nVXNlci5hY2NvdW50cy5maW5kKFxyXG4gICAgICAgICAgKGFjYykgPT4gYWNjLnByb3ZpZGVyID09PSBhY2NvdW50Py5wcm92aWRlclxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghZXhpc3RpbmdBY2NvdW50ICYmIGFjY291bnQpIHtcclxuICAgICAgICAgIGF3YWl0IHByaXNtYS5hY2NvdW50LmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICB1c2VySWQ6IGV4aXN0aW5nVXNlci5pZCxcclxuICAgICAgICAgICAgICB0eXBlOiBhY2NvdW50LnR5cGUsXHJcbiAgICAgICAgICAgICAgcHJvdmlkZXI6IGFjY291bnQucHJvdmlkZXIsXHJcbiAgICAgICAgICAgICAgcHJvdmlkZXJBY2NvdW50SWQ6IGFjY291bnQucHJvdmlkZXJBY2NvdW50SWQsXHJcbiAgICAgICAgICAgICAgcmVmcmVzaF90b2tlbjogYWNjb3VudC5yZWZyZXNoX3Rva2VuLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgICAgZXhwaXJlc19hdDogYWNjb3VudC5leHBpcmVzX2F0LFxyXG4gICAgICAgICAgICAgIHRva2VuX3R5cGU6IGFjY291bnQudG9rZW5fdHlwZSxcclxuICAgICAgICAgICAgICBzY29wZTogYWNjb3VudC5zY29wZSxcclxuICAgICAgICAgICAgICBpZF90b2tlbjogYWNjb3VudC5pZF90b2tlbixcclxuICAgICAgICAgICAgICBzZXNzaW9uX3N0YXRlOiBhY2NvdW50LnNlc3Npb25fc3RhdGUgYXMgc3RyaW5nIHwgbnVsbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyLCBhY2NvdW50IH0pIHtcclxuICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICB0b2tlbi5zdWIgPSB1c2VyLmlkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodG9rZW4uc3ViKSB7XHJcbiAgICAgICAgY29uc3QgZGJVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgICB3aGVyZTogeyBpZDogdG9rZW4uc3ViIH0sXHJcbiAgICAgICAgICBzZWxlY3Q6IHtcclxuICAgICAgICAgICAgaWQ6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRydWUsXHJcbiAgICAgICAgICAgIGVtYWlsOiB0cnVlLFxyXG4gICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChkYlVzZXIpIHtcclxuICAgICAgICAgIHRva2VuLm5hbWUgPSBkYlVzZXIubmFtZTtcclxuICAgICAgICAgIHRva2VuLmVtYWlsID0gZGJVc2VyLmVtYWlsO1xyXG4gICAgICAgICAgdG9rZW4ucGljdHVyZSA9IGRiVXNlci5pbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0b2tlbjtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcclxuICAgICAgaWYgKHRva2VuLnN1YiAmJiBzZXNzaW9uLnVzZXIpIHtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5zdWI7XHJcbiAgICAgICAgY29uc3QgZGJVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgICB3aGVyZTogeyBpZDogdG9rZW4uc3ViIH0sXHJcbiAgICAgICAgICBzZWxlY3Q6IHtcclxuICAgICAgICAgICAgaWQ6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRydWUsXHJcbiAgICAgICAgICAgIGVtYWlsOiB0cnVlLFxyXG4gICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChkYlVzZXIpIHtcclxuICAgICAgICAgIHNlc3Npb24udXNlci5uYW1lID0gZGJVc2VyLm5hbWU7XHJcbiAgICAgICAgICBzZXNzaW9uLnVzZXIuZW1haWwgPSBkYlVzZXIuZW1haWw7XHJcbiAgICAgICAgICBzZXNzaW9uLnVzZXIuaW1hZ2UgPSBkYlVzZXIuaW1hZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgZGVidWc6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX0RFQlVHID09PSAndHJ1ZScsXHJcbn07XHJcbiJdLCJuYW1lcyI6WyJHb29nbGVQcm92aWRlciIsIlByaXNtYUFkYXB0ZXIiLCJwcmlzbWEiLCJnZXRTZWNyZXQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVEFVVEhfU0VDUkVUIiwiRXJyb3IiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJzZWNyZXQiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsIkdPT0dMRV9DTElFTlRfSUQiLCJjbGllbnRTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsImFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZyIsInNlc3Npb24iLCJzdHJhdGVneSIsIm1heEFnZSIsInBhZ2VzIiwic2lnbkluIiwiZXJyb3IiLCJjYWxsYmFja3MiLCJyZWRpcmVjdCIsInVybCIsImJhc2VVcmwiLCJzdGFydHNXaXRoIiwicGFyc2VkIiwiVVJMIiwic2VhcmNoUGFyYW1zIiwiZ2V0IiwibG9naW5QYXRoIiwidXNlciIsImFjY291bnQiLCJwcm9maWxlIiwiZW1haWwiLCJleGlzdGluZ1VzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpbmNsdWRlIiwiYWNjb3VudHMiLCJleGlzdGluZ0FjY291bnQiLCJmaW5kIiwiYWNjIiwicHJvdmlkZXIiLCJjcmVhdGUiLCJkYXRhIiwidXNlcklkIiwiaWQiLCJ0eXBlIiwicHJvdmlkZXJBY2NvdW50SWQiLCJyZWZyZXNoX3Rva2VuIiwiYWNjZXNzX3Rva2VuIiwiZXhwaXJlc19hdCIsInRva2VuX3R5cGUiLCJzY29wZSIsImlkX3Rva2VuIiwic2Vzc2lvbl9zdGF0ZSIsImp3dCIsInRva2VuIiwic3ViIiwiZGJVc2VyIiwic2VsZWN0IiwibmFtZSIsImltYWdlIiwicGljdHVyZSIsImRlYnVnIiwiTkVYVEFVVEhfREVCVUciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth/config.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth/helpers.ts":
/*!*********************************!*\
  !*** ./src/lib/auth/helpers.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ApiErrors: () => (/* binding */ ApiErrors),\n/* harmony export */   getAuthenticatedUser: () => (/* binding */ getAuthenticatedUser),\n/* harmony export */   requireAuth: () => (/* binding */ requireAuth)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/../../node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/../../node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config */ \"(rsc)/./src/lib/auth/config.ts\");\n\n\n\nasync function getAuthenticatedUser() {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_config__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session?.user?.id) {\n        return null;\n    }\n    return {\n        id: session.user.id,\n        email: session.user.email,\n        name: session.user.name,\n        image: session.user.image\n    };\n}\nasync function requireAuth() {\n    const user = await getAuthenticatedUser();\n    if (!user) {\n        return {\n            user: null,\n            error: next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: {\n                    code: \"UNAUTHORIZED\",\n                    message: \"Authentication required\"\n                }\n            }, {\n                status: 401\n            })\n        };\n    }\n    return {\n        user,\n        error: null\n    };\n}\nconst ApiErrors = {\n    unauthorized: ()=>next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: {\n                code: \"UNAUTHORIZED\",\n                message: \"Authentication required\"\n            }\n        }, {\n            status: 401\n        }),\n    forbidden: ()=>next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: {\n                code: \"FORBIDDEN\",\n                message: \"Access denied\"\n            }\n        }, {\n            status: 403\n        }),\n    notFound: (resource = \"Resource\")=>next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: {\n                code: \"NOT_FOUND\",\n                message: `${resource} not found`\n            }\n        }, {\n            status: 404\n        }),\n    badRequest: (message)=>next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: {\n                code: \"BAD_REQUEST\",\n                message\n            }\n        }, {\n            status: 400\n        }),\n    internal: (message = \"Internal server error\")=>next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: {\n                code: \"INTERNAL_ERROR\",\n                message\n            }\n        }, {\n            status: 500\n        })\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgvaGVscGVycy50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQTJDO0FBQ0U7QUFDTjtBQVNoQyxlQUFlRztJQUNwQixNQUFNQyxVQUFVLE1BQU1ILDJEQUFnQkEsQ0FBQ0MsZ0RBQVdBO0lBRWxELElBQUksQ0FBQ0UsU0FBU0MsTUFBTUMsSUFBSTtRQUN0QixPQUFPO0lBQ1Q7SUFFQSxPQUFPO1FBQ0xBLElBQUlGLFFBQVFDLElBQUksQ0FBQ0MsRUFBRTtRQUNuQkMsT0FBT0gsUUFBUUMsSUFBSSxDQUFDRSxLQUFLO1FBQ3pCQyxNQUFNSixRQUFRQyxJQUFJLENBQUNHLElBQUk7UUFDdkJDLE9BQU9MLFFBQVFDLElBQUksQ0FBQ0ksS0FBSztJQUMzQjtBQUNGO0FBRU8sZUFBZUM7SUFJcEIsTUFBTUwsT0FBTyxNQUFNRjtJQUVuQixJQUFJLENBQUNFLE1BQU07UUFDVCxPQUFPO1lBQ0xBLE1BQU07WUFDTk0sT0FBT1gscURBQVlBLENBQUNZLElBQUksQ0FDdEI7Z0JBQUVDLFNBQVM7Z0JBQU9GLE9BQU87b0JBQUVHLE1BQU07b0JBQWdCQyxTQUFTO2dCQUEwQjtZQUFFLEdBQ3RGO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7SUFDRjtJQUVBLE9BQU87UUFBRVg7UUFBTU0sT0FBTztJQUFLO0FBQzdCO0FBRU8sTUFBTU0sWUFBWTtJQUN2QkMsY0FBYyxJQUNabEIscURBQVlBLENBQUNZLElBQUksQ0FDZjtZQUFFQyxTQUFTO1lBQU9GLE9BQU87Z0JBQUVHLE1BQU07Z0JBQWdCQyxTQUFTO1lBQTBCO1FBQUUsR0FDdEY7WUFBRUMsUUFBUTtRQUFJO0lBR2xCRyxXQUFXLElBQ1RuQixxREFBWUEsQ0FBQ1ksSUFBSSxDQUNmO1lBQUVDLFNBQVM7WUFBT0YsT0FBTztnQkFBRUcsTUFBTTtnQkFBYUMsU0FBUztZQUFnQjtRQUFFLEdBQ3pFO1lBQUVDLFFBQVE7UUFBSTtJQUdsQkksVUFBVSxDQUFDQyxXQUFtQixVQUFVLEdBQ3RDckIscURBQVlBLENBQUNZLElBQUksQ0FDZjtZQUFFQyxTQUFTO1lBQU9GLE9BQU87Z0JBQUVHLE1BQU07Z0JBQWFDLFNBQVMsQ0FBQyxFQUFFTSxTQUFTLFVBQVUsQ0FBQztZQUFDO1FBQUUsR0FDakY7WUFBRUwsUUFBUTtRQUFJO0lBR2xCTSxZQUFZLENBQUNQLFVBQ1hmLHFEQUFZQSxDQUFDWSxJQUFJLENBQ2Y7WUFBRUMsU0FBUztZQUFPRixPQUFPO2dCQUFFRyxNQUFNO2dCQUFlQztZQUFRO1FBQUUsR0FDMUQ7WUFBRUMsUUFBUTtRQUFJO0lBR2xCTyxVQUFVLENBQUNSLFVBQWtCLHVCQUF1QixHQUNsRGYscURBQVlBLENBQUNZLElBQUksQ0FDZjtZQUFFQyxTQUFTO1lBQU9GLE9BQU87Z0JBQUVHLE1BQU07Z0JBQWtCQztZQUFRO1FBQUUsR0FDN0Q7WUFBRUMsUUFBUTtRQUFJO0FBRXBCLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZmVhaS9mcm9udGVuZC8uL3NyYy9saWIvYXV0aC9oZWxwZXJzLnRzP2YwMzMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJztcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICcuL2NvbmZpZyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEF1dGhlbnRpY2F0ZWRVc2VyIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbiAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXV0aGVudGljYXRlZFVzZXIoKTogUHJvbWlzZTxBdXRoZW50aWNhdGVkVXNlciB8IG51bGw+IHtcclxuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XHJcblxyXG4gIGlmICghc2Vzc2lvbj8udXNlcj8uaWQpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGlkOiBzZXNzaW9uLnVzZXIuaWQsXHJcbiAgICBlbWFpbDogc2Vzc2lvbi51c2VyLmVtYWlsISxcclxuICAgIG5hbWU6IHNlc3Npb24udXNlci5uYW1lLFxyXG4gICAgaW1hZ2U6IHNlc3Npb24udXNlci5pbWFnZSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZUF1dGgoKTogUHJvbWlzZTxcclxuICB7IHVzZXI6IEF1dGhlbnRpY2F0ZWRVc2VyOyBlcnJvcjogbnVsbCB9IHxcclxuICB7IHVzZXI6IG51bGw7IGVycm9yOiBOZXh0UmVzcG9uc2UgfVxyXG4+IHtcclxuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0QXV0aGVudGljYXRlZFVzZXIoKTtcclxuXHJcbiAgaWYgKCF1c2VyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB1c2VyOiBudWxsLFxyXG4gICAgICBlcnJvcjogTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgY29kZTogJ1VOQVVUSE9SSVpFRCcsIG1lc3NhZ2U6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxyXG4gICAgICApLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IHVzZXIsIGVycm9yOiBudWxsIH07XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBBcGlFcnJvcnMgPSB7XHJcbiAgdW5hdXRob3JpemVkOiAoKSA9PlxyXG4gICAgTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IGNvZGU6ICdVTkFVVEhPUklaRUQnLCBtZXNzYWdlOiAnQXV0aGVudGljYXRpb24gcmVxdWlyZWQnIH0gfSxcclxuICAgICAgeyBzdGF0dXM6IDQwMSB9XHJcbiAgICApLFxyXG5cclxuICBmb3JiaWRkZW46ICgpID0+XHJcbiAgICBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgY29kZTogJ0ZPUkJJRERFTicsIG1lc3NhZ2U6ICdBY2Nlc3MgZGVuaWVkJyB9IH0sXHJcbiAgICAgIHsgc3RhdHVzOiA0MDMgfVxyXG4gICAgKSxcclxuXHJcbiAgbm90Rm91bmQ6IChyZXNvdXJjZTogc3RyaW5nID0gJ1Jlc291cmNlJykgPT5cclxuICAgIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBjb2RlOiAnTk9UX0ZPVU5EJywgbWVzc2FnZTogYCR7cmVzb3VyY2V9IG5vdCBmb3VuZGAgfSB9LFxyXG4gICAgICB7IHN0YXR1czogNDA0IH1cclxuICAgICksXHJcblxyXG4gIGJhZFJlcXVlc3Q6IChtZXNzYWdlOiBzdHJpbmcpID0+XHJcbiAgICBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgY29kZTogJ0JBRF9SRVFVRVNUJywgbWVzc2FnZSB9IH0sXHJcbiAgICAgIHsgc3RhdHVzOiA0MDAgfVxyXG4gICAgKSxcclxuXHJcbiAgaW50ZXJuYWw6IChtZXNzYWdlOiBzdHJpbmcgPSAnSW50ZXJuYWwgc2VydmVyIGVycm9yJykgPT5cclxuICAgIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBjb2RlOiAnSU5URVJOQUxfRVJST1InLCBtZXNzYWdlIH0gfSxcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApLFxyXG59O1xyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwiZ2V0QXV0aGVudGljYXRlZFVzZXIiLCJzZXNzaW9uIiwidXNlciIsImlkIiwiZW1haWwiLCJuYW1lIiwiaW1hZ2UiLCJyZXF1aXJlQXV0aCIsImVycm9yIiwianNvbiIsInN1Y2Nlc3MiLCJjb2RlIiwibWVzc2FnZSIsInN0YXR1cyIsIkFwaUVycm9ycyIsInVuYXV0aG9yaXplZCIsImZvcmJpZGRlbiIsIm5vdEZvdW5kIiwicmVzb3VyY2UiLCJiYWRSZXF1ZXN0IiwiaW50ZXJuYWwiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth/helpers.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth/index.ts":
/*!*******************************!*\
  !*** ./src/lib/auth/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ApiErrors: () => (/* reexport safe */ _helpers__WEBPACK_IMPORTED_MODULE_1__.ApiErrors),\n/* harmony export */   authOptions: () => (/* reexport safe */ _config__WEBPACK_IMPORTED_MODULE_0__.authOptions),\n/* harmony export */   getAuthenticatedUser: () => (/* reexport safe */ _helpers__WEBPACK_IMPORTED_MODULE_1__.getAuthenticatedUser),\n/* harmony export */   requireAuth: () => (/* reexport safe */ _helpers__WEBPACK_IMPORTED_MODULE_1__.requireAuth)\n/* harmony export */ });\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ \"(rsc)/./src/lib/auth/config.ts\");\n/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ \"(rsc)/./src/lib/auth/helpers.ts\");\n/**\r\n * Auth: NextAuth config and API auth helpers.\r\n * Use: import { authOptions, requireAuth, ApiErrors } from '@/lib/auth'\r\n */ \n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgvaW5kZXgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7OztDQUdDLEdBRXNDO0FBTXBCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGZlYWkvZnJvbnRlbmQvLi9zcmMvbGliL2F1dGgvaW5kZXgudHM/Yzk3OSJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQXV0aDogTmV4dEF1dGggY29uZmlnIGFuZCBBUEkgYXV0aCBoZWxwZXJzLlxyXG4gKiBVc2U6IGltcG9ydCB7IGF1dGhPcHRpb25zLCByZXF1aXJlQXV0aCwgQXBpRXJyb3JzIH0gZnJvbSAnQC9saWIvYXV0aCdcclxuICovXHJcblxyXG5leHBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJy4vY29uZmlnJztcclxuZXhwb3J0IHtcclxuICBnZXRBdXRoZW50aWNhdGVkVXNlcixcclxuICByZXF1aXJlQXV0aCxcclxuICBBcGlFcnJvcnMsXHJcbiAgdHlwZSBBdXRoZW50aWNhdGVkVXNlcixcclxufSBmcm9tICcuL2hlbHBlcnMnO1xyXG4iXSwibmFtZXMiOlsiYXV0aE9wdGlvbnMiLCJnZXRBdXRoZW50aWNhdGVkVXNlciIsInJlcXVpcmVBdXRoIiwiQXBpRXJyb3JzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth/index.ts\n");

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