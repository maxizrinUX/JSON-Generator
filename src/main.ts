import './style.css'
import { JSONGenerator, type IVariable } from './GenJSON.ts'
import { Guid } from 'guid-typescript'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>    
    <div class="card">
      <button id="generate" type="button"></button>
      <button id="copy" type="button"></button>
      </div>    
      <pre id="result"></pre>
  </div>
`

const buttonGen = document.querySelector<HTMLButtonElement>('#generate')!
const buttonCpy = document.querySelector<HTMLButtonElement>('#copy')!
buttonGen.innerText = "Generate";
buttonCpy.innerText = "Copy to clipboard";

const result = document.querySelector<HTMLButtonElement>('#result')!
buttonCpy.addEventListener("click", () => {
  const data = testGeneration();
  const jsonResult = JSON.stringify(data, null, 4);
  navigator.clipboard.writeText(jsonResult);
});
buttonGen.addEventListener("click", () => {
  const data = testGeneration();
  const jsonResult = JSON.stringify(data, null, 4);
  result.innerText = jsonResult;
});

// Add your test code here!
function testGeneration() {
  const generator = new JSONGenerator();

  const generationData: IVariable[] = generationData_CNC_M();

  return generator.generate(generationData);
}

function generationData_CNC_M(): IVariable[] {

  const quantitiesProd = {
    bits: [5, 15],
    devices1: [1, 20],
    devices2: [1, 20],
    devices3: [0, 16],
    measured: [40],
    frequencies: [20]
  }

  const quantitiesDebug = {
    bits: [1],
    devices1: [1, 2],
    devices2: [1, 2],
    devices3: [1, 2],
    measured: [4],
    frequencies: [20]
  }

  const quantities = quantitiesDebug;

  const entityTypes = {
    station: "/esmt/entities/StationDetails",
    pBit: "/esmt/entities/StationPBit",
    cBit: "/esmt/entities/StationCBit",
    iBit: "/esmt/entities/StationIBit",
    mBit: "/esmt/entities/StationMaintenance",
    singleBit: "SingleBit",
    device: "Device",
    measurement: "MeasuredElements",
    parameter: "Parameter",
    frequency: "Frequency"
  }

  // Define station data to keep it consistent across the file.
  const stations = [{
    Name: "Station 1",
    EntityId: Guid.create().toString(),
    IsLocalStation: true
  }, {
    Name: "Station 2",
    EntityId: Guid.create().toString(),
    IsLocalStation: false
  }];

  let stationIndex = 0;
  const stationDataMethod = (data: "Name" | "EntityId" | "IsLocalStation", advance = false) => {
    if (advance) {
      return () => {
        const station = stations[stationIndex % stations.length];
        stationIndex++;
        return station[data];
      }
    } else {
      return () => {
        return stations[stationIndex % stations.length][data];
      }
    }
  }

  // Recursive structure for Device.
  const devices: IVariable = {
    name: "OrderedDeviceCollection", type: "object", children: [
      { name: "Index", type: "index" },
      { name: "Name", type: "string" },
      { name: "Type", setValues: [entityTypes.device] },
      { name: "Status", type: "int", numRange: [0, 6] },
      { name: "ViewType", setValues: [0, 1] },
      { name: "LastUpdatedAt", setValues: [new Date().toISOString()], probability: 0.5 }
      // More devices here.
    ]
  };

  // Station Bit, because I P C are all the same.
  const stationCBit: IVariable = {
    name: "StationCBit", type: 'object', count: stations.length, children: [
      { name: "Id", type: "guid" },
      { name: "EntityId", type: "method", customMethod: stationDataMethod("EntityId", true) },
      { name: "Type", setValues: [entityTypes.cBit] },
      { name: "BITProcessStatus", setValues: [0] },
      { name: "BitType", setValues: [0] },
      // Tests
      {
        name: "BITList", type: "object", count: quantities.bits, children: [
          { name: "TestId", type: "unique-int" },
          { name: "Name", type: "string" },
          { name: "Type", setValues: [entityTypes.singleBit] },
          { name: "Description", type: "string" },
          { name: "LastUpdatedAt", setValues: [new Date().toISOString()], probability: 0.5 },
          { name: "LastTestedAt", setValues: [new Date().toISOString()], probability: 0.5 },
          { name: "Status", type: "int", numRange: [0, 6] },
          { name: "FailureMessage", type: "string" },
          { name: "MeaningMessage", type: "string" },
          { name: "IsReadyState", type: "bool" },
          { name: "SelectableLevel", setValues: [0, 1] },
          {
            // Columns
            ...devices, count: quantities.devices1, children: devices.children?.concat({
              // Rows
              ...devices, count: quantities.devices2, children: devices.children?.concat({
                // Items
                ...devices, count: quantities.devices3, children: devices.children?.concat({ name: devices.name, setValues: [[]] })
              })
            })
          },
        ]
      }
    ]
  };

  // Measured Element parameters repeat.
  const vParameter: IVariable = {
    name: "vParameter",
    type: "object",
    children: [
      { name: "Id", type: "unique-int", },
      { name: "Type", setValues: [entityTypes.parameter] },
      { name: "ElementId", type: "method", customMethod: (parent) => parent!.getParent()!["Id"] },
      { name: "ParameterType", setValues: ["V"] },
      { name: "Active", type: "bool", },
      { name: "TestStatus", type: "int", numRange: [0, 6] },
    ]
  }
  const hParameter: IVariable = {
    ...vParameter,
    name: "hParameter",
    children: [...vParameter.children!, { name: "ParameterType", setValues: ["H"] }]
  };

  // MARK: CNC M Vars
  return [
    {
      name: "User", type: "object", children: [
        { name: "username", setValues: ["Israel Israeli"] }
      ]
    },
    {
      name: "Configuration", type: "object", count: 1, children: [
        { name: "Id", type: "unique-int" },
        { name: "IsLocalStationMode", type: "method", customMethod: stationDataMethod("IsLocalStation") },
        { name: "Name", type: "method", customMethod: stationDataMethod("Name") },
        { name: "StationId", type: "method", customMethod: stationDataMethod("EntityId", true) },
        { name: "StationType", type: "method", customMethod: (parent) => parent && parent["IsLocalStationMode"] ? "LM" : "Broker" },
        {
          name: "CustomFieldsForSingleBitView", setValues: [
            [
              "Name",
              "Description",
              "Status",
              "FailureMessage",
              "MeaningMessage"
            ]
          ]
        },
      ]
    },
    {
      name: "Stations", type: "object", count: stations.length, children: [
        { name: "Id", type: "unique-int" },
        { name: "Name", type: "method", customMethod: stationDataMethod("Name") },
        { name: "State", setValues: ["Maintenance"] },
        { name: "Type", setValues: [entityTypes.station] },
        { name: "EntityId", type: "method", customMethod: stationDataMethod("EntityId", true) },
      ]
    },
    stationCBit,
    { ...stationCBit, name: "StationIBit", children: stationCBit.children?.concat({ name: "Type", setValues: [entityTypes.iBit] },) },
    { ...stationCBit, name: "StationPBit", children: stationCBit.children?.concat({ name: "Type", setValues: [entityTypes.pBit] },) },
    { ...stationCBit, name: "StationMaintenance", children: stationCBit.children?.concat({ name: "Type", setValues: [entityTypes.mBit] },) },
    {
      name: "MeasuredElements", type: "object", count: quantities.measured, children: [
        { name: "Id", type: "index" },
        { name: "name", type: "string" },
        { name: "Type", setValues: [entityTypes.measurement] },
        hParameter,
        vParameter
      ]
    },
    {
      name: "Frequency", type: "object", count: quantities.frequencies, children: [
        { name: "Id", type: 'guid' },
        { name: "Name", type: "string" },
        { name: "Type", setValues: [entityTypes.frequency] },
        { name: "Description", type: "string" },
        { name: "Status", setValues: ["idle"] },
        { name: "LastTestedAt", setValues: [new Date().toISOString()], probability: 0.5 }
      ]
    },
  ];
}