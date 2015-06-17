import Utils     = require("../helpers/Utils");
import transform = require("./ITransform");

class BaseTransformer implements transform.ITransform {
    id:          string;
    description: string;
    /**
     * Accepted input types.
     */
    inputDataTypes:  transform.InputDataType[];
    /**
     * Generated output types.
     */
    outputDataTypes: transform.OutputDataType[];

    //create?(opt?: ITransformFactoryOptions[]): stream.Readable | stream.Writable | stream.Transform;

    constructor(public title: string) {
        this.id = Utils.newGuid();
        //this.description = description;
    }

}
export=BaseTransformer;
