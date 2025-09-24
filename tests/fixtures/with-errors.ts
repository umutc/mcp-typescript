function add(a: number, b: number): string {
  return a + b; // Type error: number is not assignable to string
}

const result = add("5", 10); // Type error: string is not assignable to number
const unused = "this variable is unused"; // Warning: unused variable

export { add };