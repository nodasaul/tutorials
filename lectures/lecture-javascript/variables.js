// -- global variables --
// an integer stored as number
a = 0;
// a string
b = "1";
// an array
c = ["Paul", "John", "Ringo", "George"];
// another array
d = [1981, 1984, 1954, 1949];
// yet another array, but PLEASE don't do this for real!
e = [1, 2, "3", [4]];
// a boolean
f = false;
// checking f's type
console.log(typeof(f));
// redefining f as a float stored as a number
f = 34.56;
// again checking f's type
console.log(typeof(f));

// -- "local", function-scoped variables --
// var is discouraged because of the uncommon scope
var name="Alex";

// New in ES6
// -- "local", block-scoped variables --
let age=36;

// New in ES6
// -- constants -- but note, complex data types remain mutable
const GENDER="Male";