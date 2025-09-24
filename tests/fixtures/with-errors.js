"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = add;
function add(a, b) {
    return a + b; // Type error: number is not assignable to string
}
const result = add("5", 10); // Type error: string is not assignable to number
const unused = "this variable is unused"; // Warning: unused variable
//# sourceMappingURL=with-errors.js.map