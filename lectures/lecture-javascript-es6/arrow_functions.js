myNumbers = [13, 16, 19, 22];

// the shorthand arrow function
myNumbers = myNumbers.map(d => d*2);
console.log(myNumbers);

// a function with no parameter that returns 12
let f1 = () => 12;
console.log("f1: " + f1());

// a function that multiplies a parameter
let f2 = x => x * 2;
console.log("f2 for 4:", f2(4));

// a function with two parameters
let f3 = (x,y) => {
	let z = x * 2 + y;
	y++;
	x *= 3;
	return (x + y + z) / 2;
};
console.log("f2 for 3, 4: " + f3(3, 4));