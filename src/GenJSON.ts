import { Guid } from "guid-typescript";

export class JSONGenerator {

    private runningId = 0;

    public generate(template: IVariable[], indexStart = 0, parent?: MyObject) {

        const obj: MyObject = { getParent: () => parent };
        template.forEach(v => {
            // Check if this variable is to be generated at all.
            if (v.probability) {
                if (typeof (v.probability) == "number") {
                    if (Math.random() > v.probability)
                        return;
                } else {
                    if (!v.probability(obj))
                        return;
                }
            }

            if (v.count === undefined) {
                // Generate a simple variable.
                obj[v.name] = this.genVariable(v, indexStart, obj);
            } else if (typeof (v.count) == "number" || v.count.length == 1) {
                // Generate an array of variables of a given length.
                obj[v.name] = [];
                const count = typeof (v.count) == "number" ? v.count : v.count[0];
                for (let i = 0; i < count; i++) {
                    obj[v.name].push(this.genVariable(v, i, obj));
                }
            } else {
                // Generate an array of random length constrained to given range.
                obj[v.name] = [];
                const count = Math.floor(Math.random() * (v.count[1] - v.count[0]) + v.count[0]);
                for (let i = 0; i < count; i++) {
                    obj[v.name].push(this.genVariable(v, i, obj));
                }
            }

        });
        return obj;
    }

    private genVariable(v: IVariable, iteration: number, parentObject?: MyObject | undefined) {
        if (v.setValues) {
            return v.setValues[Math.floor(Math.random() * v.setValues.length)];
        }
        switch (v.type) {
            case "string":
                const inOptions: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_ ';
                let count: number;
                if (v.numRange) {
                    count = Math.floor(Math.random() * (v.numRange[1] - v.numRange[0])) + v.numRange[0] + 1;
                } else {
                    count = Math.floor(Math.random() * 5) + 6;
                }

                let res = "";
                let firstLast = inOptions[Math.floor(Math.random() * inOptions.length)];
                // Make sure that first and last characters are not spaces.
                while (firstLast == ' ') {
                    firstLast = inOptions[Math.floor(Math.random() * inOptions.length)];
                }
                res += firstLast;
                for (let i = 1; i < count - 1; i++) {
                    res += inOptions[Math.floor(Math.random() * inOptions.length)];
                }
                firstLast = inOptions[Math.floor(Math.random() * inOptions.length)];
                // Make sure that first and last characters are not spaces.
                while (firstLast == ' ') {
                    firstLast = inOptions[Math.floor(Math.random() * inOptions.length)];
                }
                res += firstLast;
                return res;
            case "object":
                const obj: MyObject = this.generate(v.children ?? [], iteration, parentObject);
                return obj;
            case "bool":
                const rand = Math.random();
                if (v.numRange) {
                    return rand >= v.numRange[0] && rand <= v.numRange[1];
                }
                return rand > 0.5;
            case "float":
                v.numRange ??= [0, 1];
                return Math.random() * (v.numRange[1] - v.numRange[0]) + v.numRange[0];
            case "int":
                v.numRange ??= [0, 10];
                return Math.floor(Math.random() * (v.numRange[1] - v.numRange[0]) + v.numRange[0]);
            case "unique-int":
                return this.runningId++;
            case "date":
                v.numRange ??= [Date.now(), Date.now() + 1000 * 60 * 60 * 24];
                return new Date(Math.floor(Math.random() * (v.numRange[1] - v.numRange[0]) + v.numRange[0]));
            case "guid":
                return Guid.create().toString();
            case "index":
                return iteration;
            case "method":
                if (v.customMethod)
                    return v.customMethod(parentObject);
                return null;
            default:
                return null;
        }
    }
}

type VarType = "int" | "float" | "string" | "unique-int" | "date" | "object" | "bool" | "index" | "method" | "guid";

export interface IVariable {
    /** The name of the variable */
    name: string;
    /** The odds of a variable generating at all, for example: a description that only some elements have.
     * Expected value is between 0 to 1.
     * <= 0 never generate, >= 1 always generate.
     * Alternatively a method can be provided to determine this, input argument is the parent object being built.
     * NOTE: Variables are built in the order they are provided in the meta data, so be careful not to rely on the presence of variables that aren't generated yet.
     */
    probability?: number | ((parentObject: any) => (boolean));
    /** Type to generate, if values are constant, use setValues instead, if neither are provided, value will be null */
    type?: VarType;
    /** If provided, variable generated will be an array of desired type, or of given values as provided in setValues */
    count?: number | number[];
    /** Content of variable in case it is an object type, if not provided for object, object will be empty {} */
    children?: IVariable[];
    /** Generation constraint for numeric values, expects an array of [min value, max value].
     * If not provided, integers will generate in range of 0 to 10, float 0 to 1, strings will generate in length 5 to 10, boolean will be 50% true, and Date from now to now + 24 hours.
     * For date, the range is in Unix time, milliseconds since 1, 1, 1970.
     * For boolean, values will be tested against a random number from 0 to 1 to determine if value should be true.
     */
    numRange?: number[];
    /** Predetermined values that will be picked at random to assign to this variable, this overrides variable generation. */
    setValues?: any[];
    /** A custom method to generate whatever is desired, will be invoked when type is set to "method".
     * Input parameter is the parent object currently being built.
     * Will generate null if not provided.
     * NOTE: Variables are built in the order they are provided in the meta data, so be careful not to rely on the presence of variables that aren't generated yet.
     */
    customMethod?: (parentObject?: MyObject) => (any);
}

interface IHasParent {
    getParent(): MyObject | undefined;
}

type MyObject = IHasParent & { [id: string]: any; }
