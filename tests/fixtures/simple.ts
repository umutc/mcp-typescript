function hello(name: string): string {
  return `Hello, ${name}!`;
}

const message = hello("World");
console.log(message);

export { hello };