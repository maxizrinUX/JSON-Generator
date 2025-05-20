
export class JSONGenerator {

    private runningId = 0;

    public generate(template: IVariable[], indexStart = 0) {

        const obj: any = {};
        template.forEach(v => {
            if (v.probability != undefined && Math.random() < v.probability) {
                return;
            }
            if (v.count === undefined) {
                obj[v.name] = this.genVariable(v, indexStart);
            } else if (typeof (v.count) == "number" || v.count.length == 1) {
                obj[v.name] = [];
                const count = typeof (v.count) == "number" ? v.count : v.count[0];
                for (let i = 0; i < count; i++) {
                    obj[v.name].push(this.genVariable(v, i));
                }
            } else {
                obj[v.name] = [];
                const count = Math.floor(Math.random() * (v.count[1] - v.count[0]) + v.count[0]);
                for (let i = 0; i < count; i++) {
                    obj[v.name].push(this.genVariable(v, i));
                }
            }

        });
        return obj;
    }

    private genVariable(v: IVariable, iteration: number) {
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
                if (v.children && v.children.length > 0)
                    return this.generate(v.children, iteration);
                else
                    return {};
            case "bool":
                if (v.numRange) {
                    const rand = Math.random();
                    return rand >= v.numRange[0] && rand <= v.numRange[1];
                }
                return Math.random() > 0.5;
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
            case "index":
                return iteration;
            default:
                return null;
        }
    }
}

type VarType = "int" | "float" | "string" | "unique-int" | "date" | "object" | "bool" | "index";

export interface IVariable {
    /** The name of the variable */
    name: string;
    /** The odds of a variable generating at all, for example: a description that only some elements have.
     * Expected value is between 0 to 1.
     * <= 0 never generate, >= 1 always generate.
     */
    probability?: number;
    /** Type to generate, if values are constant, use setValues instead, if neither are provided, value will be null */
    type?: VarType;
    /** If provided, variable generated will be an array of desired type, or of given values as provided in setValues */
    count?: number | number[];
    /** Content of variable in case it is an object type, if not provided for object, object will be empty {} */
    children?: IVariable[];
    /** Generation constraint for numeric values, expects an array of [min value, max value].
     * If not provided, integers will generate in range of 0 to 10, float 0 to 1, strings will generate in length 5 to 10, and Date from now to now + 24 hours.
     * For date, the range is in Unix time, milliseconds since 1, 1, 1970.
     */
    numRange?: number[];
    /** Preselected values that will be picked at random to assign to this variable, this overrides variable generation. */
    setValues?: any[];
}

