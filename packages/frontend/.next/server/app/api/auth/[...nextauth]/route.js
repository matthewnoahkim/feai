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

/***/ "(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/../../node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/../../node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/../../node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_matth_New_folder_4_feai_packages_frontend_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\matth\\\\New folder (4)\\\\feai\\\\packages\\\\frontend\\\\src\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_matth_New_folder_4_feai_packages_frontend_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1hcHAtbG9hZGVyLmpzP25hbWU9YXBwJTJGYXBpJTJGYXV0aCUyRiU1Qi4uLm5leHRhdXRoJTVEJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZS50cyZhcHBEaXI9QyUzQSU1Q1VzZXJzJTVDbWF0dGglNUNOZXclMjBmb2xkZXIlMjAoNCklNUNmZWFpJTVDcGFja2FnZXMlNUNmcm9udGVuZCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDbWF0dGglNUNOZXclMjBmb2xkZXIlMjAoNCklNUNmZWFpJTVDcGFja2FnZXMlNUNmcm9udGVuZCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3dEO0FBQ3JJO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGZlYWkvZnJvbnRlbmQvP2M0YjAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcbWF0dGhcXFxcTmV3IGZvbGRlciAoNClcXFxcZmVhaVxcXFxwYWNrYWdlc1xcXFxmcm9udGVuZFxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXFsuLi5uZXh0YXV0aF1cXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwic3RhbmRhbG9uZVwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXG1hdHRoXFxcXE5ldyBmb2xkZXIgKDQpXFxcXGZlYWlcXFxccGFja2FnZXNcXFxcZnJvbnRlbmRcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxbLi4ubmV4dGF1dGhdXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/../../node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/../../node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./src/lib/prisma.ts\");\n\n\n\n// Use a stable secret for development if NEXTAUTH_SECRET is not set\nconst getSecret = ()=>{\n    if (process.env.NEXTAUTH_SECRET) {\n        return process.env.NEXTAUTH_SECRET;\n    }\n    // Fallback secret for development - DO NOT use in production\n    if (true) {\n        return \"feai-development-secret-key-do-not-use-in-production-12345\";\n    }\n    throw new Error(\"NEXTAUTH_SECRET must be set in production\");\n};\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    // Explicitly set the secret to prevent session issues\n    secret: getSecret(),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    session: {\n        strategy: \"jwt\",\n        // Extend session max age to 30 days\n        maxAge: 30 * 24 * 60 * 60\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            if (!user.email) {\n                return false;\n            }\n            // Check if user already exists\n            const existingUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                where: {\n                    email: user.email\n                },\n                include: {\n                    accounts: true\n                }\n            });\n            if (existingUser) {\n                // Check if this provider is already linked\n                const existingAccount = existingUser.accounts.find((acc)=>acc.provider === account?.provider);\n                if (!existingAccount && account) {\n                    // Link new provider account to existing user\n                    await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.account.create({\n                        data: {\n                            userId: existingUser.id,\n                            type: account.type,\n                            provider: account.provider,\n                            providerAccountId: account.providerAccountId,\n                            refresh_token: account.refresh_token,\n                            access_token: account.access_token,\n                            expires_at: account.expires_at,\n                            token_type: account.token_type,\n                            scope: account.scope,\n                            id_token: account.id_token,\n                            session_state: account.session_state\n                        }\n                    });\n                }\n            }\n            return true;\n        },\n        async jwt ({ token, user, account }) {\n            // Initial sign in\n            if (user) {\n                token.sub = user.id;\n            }\n            // Fetch latest user data from database on subsequent requests\n            if (token.sub) {\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        id: token.sub\n                    },\n                    select: {\n                        id: true,\n                        name: true,\n                        email: true,\n                        image: true\n                    }\n                });\n                if (dbUser) {\n                    token.name = dbUser.name;\n                    token.email = dbUser.email;\n                    token.picture = dbUser.image;\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token.sub && session.user) {\n                session.user.id = token.sub;\n                // Fetch latest user data from database\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        id: token.sub\n                    },\n                    select: {\n                        id: true,\n                        name: true,\n                        email: true,\n                        image: true\n                    }\n                });\n                if (dbUser) {\n                    session.user.name = dbUser.name;\n                    session.user.email = dbUser.email;\n                    session.user.image = dbUser.image;\n                }\n            }\n            return session;\n        }\n    },\n    events: {\n        async createUser ({ user }) {\n            console.log(\"New user created:\", user.email);\n        }\n    },\n    // Only enable debug in development when explicitly requested\n    debug: process.env.NEXTAUTH_DEBUG === \"true\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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eEJKLE1BQU14QixLQUFLLEdBQUcwQixPQUFPMUIsS0FBSztvQkFDMUJ3QixNQUFNTSxPQUFPLEdBQUdKLE9BQU9HLEtBQUs7Z0JBQzlCO1lBQ0Y7WUFFQSxPQUFPTDtRQUNUO1FBRUEsTUFBTWxDLFNBQVEsRUFBRUEsT0FBTyxFQUFFa0MsS0FBSyxFQUFFO1lBQzlCLElBQUlBLE1BQU1DLEdBQUcsSUFBSW5DLFFBQVFPLElBQUksRUFBRTtnQkFDN0JQLFFBQVFPLElBQUksQ0FBQ2dCLEVBQUUsR0FBR1csTUFBTUMsR0FBRztnQkFFM0IsdUNBQXVDO2dCQUN2QyxNQUFNQyxTQUFTLE1BQU1uRCwyQ0FBTUEsQ0FBQ3NCLElBQUksQ0FBQ0ssVUFBVSxDQUFDO29CQUMxQ0MsT0FBTzt3QkFBRVUsSUFBSVcsTUFBTUMsR0FBRztvQkFBQztvQkFDdkJFLFFBQVE7d0JBQ05kLElBQUk7d0JBQ0plLE1BQU07d0JBQ041QixPQUFPO3dCQUNQNkIsT0FBTztvQkFDVDtnQkFDRjtnQkFFQSxJQUFJSCxRQUFRO29CQUNWcEMsUUFBUU8sSUFBSSxDQUFDK0IsSUFBSSxHQUFHRixPQUFPRSxJQUFJO29CQUMvQnRDLFFBQVFPLElBQUksQ0FBQ0csS0FBSyxHQUFHMEIsT0FBTzFCLEtBQUs7b0JBQ2pDVixRQUFRTyxJQUFJLENBQUNnQyxLQUFLLEdBQUdILE9BQU9HLEtBQUs7Z0JBQ25DO1lBQ0Y7WUFFQSxPQUFPdkM7UUFDVDtJQUNGO0lBRUF5QyxRQUFRO1FBQ04sTUFBTUMsWUFBVyxFQUFFbkMsSUFBSSxFQUFFO1lBQ3ZCb0MsUUFBUUMsR0FBRyxDQUFDLHFCQUFxQnJDLEtBQUtHLEtBQUs7UUFDN0M7SUFDRjtJQUVBLDZEQUE2RDtJQUM3RG1DLE9BQU8xRCxRQUFRQyxHQUFHLENBQUMwRCxjQUFjLEtBQUs7QUFDeEMsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL0BmZWFpL2Zyb250ZW5kLy4vc3JjL2xpYi9hdXRoLnRzPzY2OTIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJztcclxuaW1wb3J0IEdvb2dsZVByb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlJztcclxuaW1wb3J0IHsgUHJpc21hQWRhcHRlciB9IGZyb20gJ0BhdXRoL3ByaXNtYS1hZGFwdGVyJztcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnLi9wcmlzbWEnO1xyXG5cclxuLy8gVXNlIGEgc3RhYmxlIHNlY3JldCBmb3IgZGV2ZWxvcG1lbnQgaWYgTkVYVEFVVEhfU0VDUkVUIGlzIG5vdCBzZXRcclxuY29uc3QgZ2V0U2VjcmV0ID0gKCkgPT4ge1xyXG4gIGlmIChwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQpIHtcclxuICAgIHJldHVybiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQ7XHJcbiAgfVxyXG4gIC8vIEZhbGxiYWNrIHNlY3JldCBmb3IgZGV2ZWxvcG1lbnQgLSBETyBOT1QgdXNlIGluIHByb2R1Y3Rpb25cclxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcclxuICAgIHJldHVybiAnZmVhaS1kZXZlbG9wbWVudC1zZWNyZXQta2V5LWRvLW5vdC11c2UtaW4tcHJvZHVjdGlvbi0xMjM0NSc7XHJcbiAgfVxyXG4gIHRocm93IG5ldyBFcnJvcignTkVYVEFVVEhfU0VDUkVUIG11c3QgYmUgc2V0IGluIHByb2R1Y3Rpb24nKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xyXG4gIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSBhcyBOZXh0QXV0aE9wdGlvbnNbJ2FkYXB0ZXInXSxcclxuICBcclxuICAvLyBFeHBsaWNpdGx5IHNldCB0aGUgc2VjcmV0IHRvIHByZXZlbnQgc2Vzc2lvbiBpc3N1ZXNcclxuICBzZWNyZXQ6IGdldFNlY3JldCgpLFxyXG4gIFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgR29vZ2xlUHJvdmlkZXIoe1xyXG4gICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCEsXHJcbiAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQhLFxyXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXHJcbiAgICB9KSxcclxuICBdLFxyXG5cclxuICBzZXNzaW9uOiB7XHJcbiAgICBzdHJhdGVneTogJ2p3dCcsXHJcbiAgICAvLyBFeHRlbmQgc2Vzc2lvbiBtYXggYWdlIHRvIDMwIGRheXNcclxuICAgIG1heEFnZTogMzAgKiAyNCAqIDYwICogNjAsIC8vIDMwIGRheXNcclxuICB9LFxyXG5cclxuICBwYWdlczoge1xyXG4gICAgc2lnbkluOiAnL2xvZ2luJyxcclxuICAgIGVycm9yOiAnL2xvZ2luJyxcclxuICB9LFxyXG5cclxuICBjYWxsYmFja3M6IHtcclxuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xyXG4gICAgICBpZiAoIXVzZXIuZW1haWwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHVzZXIgYWxyZWFkeSBleGlzdHNcclxuICAgICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgd2hlcmU6IHsgZW1haWw6IHVzZXIuZW1haWwgfSxcclxuICAgICAgICBpbmNsdWRlOiB7IGFjY291bnRzOiB0cnVlIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGV4aXN0aW5nVXNlcikge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgcHJvdmlkZXIgaXMgYWxyZWFkeSBsaW5rZWRcclxuICAgICAgICBjb25zdCBleGlzdGluZ0FjY291bnQgPSBleGlzdGluZ1VzZXIuYWNjb3VudHMuZmluZChcclxuICAgICAgICAgIChhY2MpID0+IGFjYy5wcm92aWRlciA9PT0gYWNjb3VudD8ucHJvdmlkZXJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWV4aXN0aW5nQWNjb3VudCAmJiBhY2NvdW50KSB7XHJcbiAgICAgICAgICAvLyBMaW5rIG5ldyBwcm92aWRlciBhY2NvdW50IHRvIGV4aXN0aW5nIHVzZXJcclxuICAgICAgICAgIGF3YWl0IHByaXNtYS5hY2NvdW50LmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICB1c2VySWQ6IGV4aXN0aW5nVXNlci5pZCxcclxuICAgICAgICAgICAgICB0eXBlOiBhY2NvdW50LnR5cGUsXHJcbiAgICAgICAgICAgICAgcHJvdmlkZXI6IGFjY291bnQucHJvdmlkZXIsXHJcbiAgICAgICAgICAgICAgcHJvdmlkZXJBY2NvdW50SWQ6IGFjY291bnQucHJvdmlkZXJBY2NvdW50SWQsXHJcbiAgICAgICAgICAgICAgcmVmcmVzaF90b2tlbjogYWNjb3VudC5yZWZyZXNoX3Rva2VuLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgICAgZXhwaXJlc19hdDogYWNjb3VudC5leHBpcmVzX2F0LFxyXG4gICAgICAgICAgICAgIHRva2VuX3R5cGU6IGFjY291bnQudG9rZW5fdHlwZSxcclxuICAgICAgICAgICAgICBzY29wZTogYWNjb3VudC5zY29wZSxcclxuICAgICAgICAgICAgICBpZF90b2tlbjogYWNjb3VudC5pZF90b2tlbixcclxuICAgICAgICAgICAgICBzZXNzaW9uX3N0YXRlOiBhY2NvdW50LnNlc3Npb25fc3RhdGUgYXMgc3RyaW5nIHwgbnVsbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyLCBhY2NvdW50IH0pIHtcclxuICAgICAgLy8gSW5pdGlhbCBzaWduIGluXHJcbiAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgdG9rZW4uc3ViID0gdXNlci5pZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggbGF0ZXN0IHVzZXIgZGF0YSBmcm9tIGRhdGFiYXNlIG9uIHN1YnNlcXVlbnQgcmVxdWVzdHNcclxuICAgICAgaWYgKHRva2VuLnN1Yikge1xyXG4gICAgICAgIGNvbnN0IGRiVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IHRva2VuLnN1YiB9LFxyXG4gICAgICAgICAgc2VsZWN0OiB7XHJcbiAgICAgICAgICAgIGlkOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxyXG4gICAgICAgICAgICBlbWFpbDogdHJ1ZSxcclxuICAgICAgICAgICAgaW1hZ2U6IHRydWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoZGJVc2VyKSB7XHJcbiAgICAgICAgICB0b2tlbi5uYW1lID0gZGJVc2VyLm5hbWU7XHJcbiAgICAgICAgICB0b2tlbi5lbWFpbCA9IGRiVXNlci5lbWFpbDtcclxuICAgICAgICAgIHRva2VuLnBpY3R1cmUgPSBkYlVzZXIuaW1hZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdG9rZW47XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XHJcbiAgICAgIGlmICh0b2tlbi5zdWIgJiYgc2Vzc2lvbi51c2VyKSB7XHJcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uc3ViO1xyXG5cclxuICAgICAgICAvLyBGZXRjaCBsYXRlc3QgdXNlciBkYXRhIGZyb20gZGF0YWJhc2VcclxuICAgICAgICBjb25zdCBkYlVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGlkOiB0b2tlbi5zdWIgfSxcclxuICAgICAgICAgIHNlbGVjdDoge1xyXG4gICAgICAgICAgICBpZDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgZW1haWw6IHRydWUsXHJcbiAgICAgICAgICAgIGltYWdlOiB0cnVlLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGRiVXNlcikge1xyXG4gICAgICAgICAgc2Vzc2lvbi51c2VyLm5hbWUgPSBkYlVzZXIubmFtZTtcclxuICAgICAgICAgIHNlc3Npb24udXNlci5lbWFpbCA9IGRiVXNlci5lbWFpbDtcclxuICAgICAgICAgIHNlc3Npb24udXNlci5pbWFnZSA9IGRiVXNlci5pbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzZXNzaW9uO1xyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBldmVudHM6IHtcclxuICAgIGFzeW5jIGNyZWF0ZVVzZXIoeyB1c2VyIH0pIHtcclxuICAgICAgY29uc29sZS5sb2coJ05ldyB1c2VyIGNyZWF0ZWQ6JywgdXNlci5lbWFpbCk7XHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIE9ubHkgZW5hYmxlIGRlYnVnIGluIGRldmVsb3BtZW50IHdoZW4gZXhwbGljaXRseSByZXF1ZXN0ZWRcclxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfREVCVUcgPT09ICd0cnVlJyxcclxufTtcclxuIl0sIm5hbWVzIjpbIkdvb2dsZVByb3ZpZGVyIiwiUHJpc21hQWRhcHRlciIsInByaXNtYSIsImdldFNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiLCJFcnJvciIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInNlY3JldCIsInByb3ZpZGVycyIsImNsaWVudElkIiwiR09PR0xFX0NMSUVOVF9JRCIsImNsaWVudFNlY3JldCIsIkdPT0dMRV9DTElFTlRfU0VDUkVUIiwiYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwibWF4QWdlIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciIsImNhbGxiYWNrcyIsInVzZXIiLCJhY2NvdW50IiwicHJvZmlsZSIsImVtYWlsIiwiZXhpc3RpbmdVc2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaW5jbHVkZSIsImFjY291bnRzIiwiZXhpc3RpbmdBY2NvdW50IiwiZmluZCIsImFjYyIsInByb3ZpZGVyIiwiY3JlYXRlIiwiZGF0YSIsInVzZXJJZCIsImlkIiwidHlwZSIsInByb3ZpZGVyQWNjb3VudElkIiwicmVmcmVzaF90b2tlbiIsImFjY2Vzc190b2tlbiIsImV4cGlyZXNfYXQiLCJ0b2tlbl90eXBlIiwic2NvcGUiLCJpZF90b2tlbiIsInNlc3Npb25fc3RhdGUiLCJqd3QiLCJ0b2tlbiIsInN1YiIsImRiVXNlciIsInNlbGVjdCIsIm5hbWUiLCJpbWFnZSIsInBpY3R1cmUiLCJldmVudHMiLCJjcmVhdGVVc2VyIiwiY29uc29sZSIsImxvZyIsImRlYnVnIiwiTkVYVEFVVEhfREVCVUciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/preact-render-to-string","vendor-chunks/@auth","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmatth%5CNew%20folder%20(4)%5Cfeai%5Cpackages%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();