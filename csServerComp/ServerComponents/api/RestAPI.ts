import LayerManager = require('./LayerManager');
import express = require('express')
import Layer = LayerManager.Layer;
import CallbackResult = LayerManager.CallbackResult;


export class RestAPI implements LayerManager.IApiInterface {

    public manager: LayerManager.LayerManager

    constructor(public server: express.Express) {

    }

    public init(layerManager: LayerManager.LayerManager, options: any) {
        this.manager = layerManager;
        console.log('init Rest API');


        //use this for testing. Serves no real purpose.
        this.server.get("/test", (req: express.Request, res: express.Response) => {
            console.log("received something.. hello world!");
            res.send({ Hello: "World" });
        });

        // layer functions, in CRUD order

        // adds a layer, using HTTP PUT, stores it in a collection of choice
        this.server.post('/layers/:layer', (req: any, res: any) => {
           this.manager.getLayer(req.params.layer, (result: CallbackResult) => {
               //todo: check error
               res.send(result.layer);
           });
       })

        // gets the entire layer, which is stored as a single collection
        this.server.get('/layers/:layer', (req: any, res: any) => {
            this.manager.getLayer(req.params.layer, (result: CallbackResult) => {
                //todo: check error
                res.send(result.layer);
            });
        })

        //adds a feature
        this.server.post("/layers/:layer/feature", (req: express.Request, res: express.Response) => {
            this.manager.addFeature(req.params.layer, req.body);
        });

        //returns a feature
        this.server.get("/layers/:layer/:id", (req: express.Request, res: express.Response) => {
            this.manager.getFeature(req.params.layer, req.params.id);
        });

        // for some reason (TS?) express doesn't work with del as http verb
        // unlike the JS version, which simply uses del as a keyword.
        // deletes a feature
        this.server.delete("/layers/:layer/feature/:id", (req: express.Request, res: express.Response) => {
            this.manager.addFeature(req.params.layer, req.params.id);
        });

        // updates all features corresponding to query on ID (should be one)
        this.server.put("/layers/:layer/feature/:id", (req: express.Request, res: express.Response) => {
            this.manager.updateFeature(req.params.layer, req.params.id);
        });

        // express api aanmaken
        // vb. addFeature,



        // doorzetten naar de layermanager


    }

}
