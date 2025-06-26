import './style.css'
import { JSONGenerator, type IVariable } from './GenJSON.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>    
    <div class="card">
      <button id="generate" type="button"></button>
      </div>    
      <pre id="result"></pre>
  </div>
`

const button = document.querySelector<HTMLButtonElement>('#generate')!
button.innerText = "Generate";

const result = document.querySelector<HTMLButtonElement>('#result')!

button.addEventListener("click", () => {

  const data = testGeneration();

  const jsonResult = JSON.stringify(data, null, 4);
  result.innerText = jsonResult;
});


// Add your test code here!
function testGeneration() {
  const generator = new JSONGenerator();

  const generationData: IVariable[] = generationData_BitForm();

  return generator.generate(generationData);
}

function generationData_BitForm(): IVariable[] {
  return [
    {
      name: 'segments', type: 'object', count: 1,
      children: [
        { name: "canAdd", type: "bool", numRange: [0, 0.5] },
        {
          name: "groups", type: "object", count: 1,
          children: [
            {
              name: "fields", type: "object", count: 1,
              children: [
                { name: "name", type: "string" },
                { name: "type", setValues: ["text", "dropdown"] },
                { name: "value", type: "method", customMethod: (parent) => parent["type"] == "dropdown" ? 0 : "Test value" },
                { name: "options", type: "string", probability: (p) => p["type"] == "dropdown", count: 1 }
              ]
            }
          ]
        }
      ]
    },
  ];
}

function generationData_Debug(): IVariable[] {
  return [
    {
      name: 'Target', type: 'object', count: 20,
      children: [
        { name: "Id", type: "unique-int" },
        { name: "Name", type: "string", numRange: [5, 10] },
        { name: "description", type: "string", numRange: [20, 50], probability: 0.5 },
      ]
    },
  ];
}