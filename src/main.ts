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

  const generationData: IVariable[] = [
    {
      name: 'Target', type: 'object', count: 20,
      children: [
        { name: "Id", type: "unique-int" },
        { name: "Name", type: "string", numRange: [5, 10] },
        { name: "description", type: "string", numRange: [20, 50], probability: 0.5 },
      ]
    },
  ];

  return generator.generate(generationData);
}