Example of JSON generation, with a recuring structure.

```const gen = new JSONGenerator();

// Set aside for recurring structure.
let reccur: IVariable = {
  name: "Recursive structure", type: "object",
  children: [
	// Index type is the index of the array of children generated, if type has count.
    { name: "Index", type: "index" },
    // If setValues is set, it overrides generation, and one of the values of the setValues array will be picked for the variable's value.
    { name: "Name", setValues: ["short", "Long name for testing"] },
	// numRange expects two numbers with the value randomly generated within the range.
    { name: "Status", type: "int", numRange: [0, 5] },
    // An example of a constant value.
    { name: "alwaysSame", setValues: [0] },
    // Don't add self, it will be added later.
  ]
};

let blueprint: IVariable[] = [
  // Unique-int is a static running integer number, that starts at 0.
  { name: "id", type: "unique-int" },
  { name: "Status", type: "int", numRange: [0, 6] },
  // numRange can be added to limit the generated string length.
  { name: "Name", type: "string"},
  { name: "Description", setValues: ["Short description", "Longer description for testing text wrap"] },
  // If numRange is set for date type, it creates a generation constraint in Unix time.
  { name: "LastUpdated", type: "date" },
  // If numRange is provided, a random number will be generated within range of 0 to 1, and if it is within range provided in numRange, variable will be true, else false.
  // For example numRange = [0, 0.2] results in a value of "true" about 20% of the time.
  // If not provided, it's 50%.
  { name: "IsReadyState", type: "bool" },  
  {
    // Recursive example, we add the recursive structure, an object type, and add a count.
	// The count parameter turns the variable into an array of the variable type.
	// count can be a number, or number[] with length 1 or 2, generating either an exact amount of objects, if only one value is provided, or generates an array of random length between the 2 provided numbers.
	// Here we are creating an array of objects, containing between 2 to 8 items.
    ...reccur, count: [2, 8],
    children: reccur.children?.concat({
      ...reccur, count: [4, 6],
      children: reccur.children?.concat({
        ...reccur, count: [3, 10],
        children: reccur.children?.concat({
		  // A count of 0 creates an empty array.
          ...reccur, count: 0
        })
      })
    })
  },
];

// Generate the JSON.
const a = gen.generate([{
  name: "My JSON",
  type: "object",
  children: blueprint,
  count: 5
}]);

// Print the resulting JSON to the console.
const ja = JSON.stringify(a, undefined, 4);```
