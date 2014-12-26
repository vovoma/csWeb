module McaEditorView { export var html = '<div class="modal-content">    <div class="modal-header">        <button type="button" class="close" data-ng-click="vm.cancel()" aria-hidden="true">&times;</button>        <h3 class="modal-title" translate>MCA.EDITOR_TITLE</h3>    </div>    <div class="modal-body container-fluid">        <div class="row-fluid">            <input type="text" class="pull-left" data-ng-model="vm.mcaTitle" style="margin: 0 5px" placeholder="{{ \'MCA.TITLE\' | translate }}" />            <!-- <span><input type="checkbox" data-ng-model="vm.hasRank" style="margin-left: 10px;" /><span translate>MCA.INCLUDE_RANK</span></span>-->            <input type="text" class="pull-left" data-ng-model="vm.rankTitle" style="margin: 0 5px"  placeholder="{{ \'MCA.RANK_TITLE\' | translate }}" />            <input type="text" class="pull-left" data-ng-model="vm.scaleMin" style="width: 100px; margin: 0 5px" placeholder="{{ \'MCA.SCALE_MIN_TITLE\' | translate }}" />            <input type="text" class="pull-left" data-ng-model="vm.scaleMax" style="width: 100px; margin: 0 5px" placeholder="{{ \'MCA.SCALE_MAX_TITLE\' | translate }}" />        </div>        <h4 class="row-fluid" style="margin-top: 5px;" translate>MCA.MAIN_FEATURE</h4>        <select data-ng-model="vm.selectedFeatureType"                data-ng-change="vm.loadPropertyTypes()"                data-ng-options="item as item.name for (key, item) in vm.dataset.featureTypes"                class="form-control row-fluid"></select>        <h4 class="row-fluid" translate>MCA.PROPERTIES</h4>        <ul class="form-group row-fluid" style="margin-top: 1em; margin-left: -2em; overflow-y: auto; overflow-x: hidden;"            resize resize-y="450">            <li ng-repeat="mi in vm.propInfos"                class="row-fluid list-unstyled truncate">                <div style="padding: 5px 0;" class="row-fluid">                    <input type="checkbox" name="vm.selectedTitles[]" value="{{mi.title}}"                           data-ng-checked="mi.isSelected"                           data-ng-click="mi.isSelected = !mi.isSelected">&nbsp;&nbsp;{{mi.title}}                    <div data-ng-if="mi.isSelected" class="pull-right">                        <a href="" class="pull-right"                           style="margin-right: 5px;"                           data-ng-click="vm.toggleItemDetails($index)"><i class="fa fa-2x fa-edit"></i></a>                        <input type="text" class="pull-right"                               style="margin: -2px 5px -2px 0;"                               data-ng-model="mi.category"                               placeholder="{{\'MCA.CATEGORY_MSG\' | translate}}" />                    </div>                    <!--<form data-ng-if="mi.isSelected" name="myForm" style="margin-left: 20px;">                <label id="scoringFunctions" data-ng-repeat="sf in vm.scoringFunctions">                    <input type="radio" data-ng-model="mi.scoringFunctionType" value="{{sf.type}}">                    <a data-ng-href="" data-ng-class="sf.cssClass" data-ng-click="mi.isSelected = !mi.isSelected"></a>                </label>            </form>            <div data-ng-if="mi.scoringFunctionType == 0" style="margin-left: 20px;">                input -> score:&nbsp;<input type="text" data-ng-model="mi.scores" placeholder="[x0,y0 x1,y1 ...]"/>            </div>-->                </div>                <div class="row-fluid" data-ng-show="vm.showItem == {{$index}}" id="scoringFunctions">                    <select class="col-xs-10"                            style="margin-right: 5px; margin-bottom: 5px;"                            data-ng-init="mi.scoringFunctionType = mi.scoringFunctionType || vm.scoringFunctions[0]"                            data-ng-model="mi.scoringFunctionType"                            data-ng-options="sf as sf.title for sf in vm.scoringFunctions"></select>                    <div class="pull-right" data-ng-class="mi.scoringFunctionType.cssClass" style="width: 40px; height: 28px; margin-top: -5px;"></div>                    <div class="row-fluid">                        <input type="text" class="col-xs-3" style="padding: 0;" data-ng-model="mi.minValue" placeholder="{{ \'MCA.MIN_VALUE\' | translate }}" />                        <input type="text" class="col-xs-3" style="padding: 0;" data-ng-model="mi.maxValue" placeholder="{{ \'MCA.MAX_VALUE\' | translate }}" />                        <input type="text" class="col-xs-3" style="padding: 0;" data-ng-model="mi.minCutoffValue" placeholder="{{ \'MCA.MIN_CUTOFF_VALUE\' | translate }}" />                        <input type="text" class="col-xs-3" style="padding: 0;" data-ng-model="mi.maxCutoffValue" placeholder="{{ \'MCA.MAX_CUTOFF_VALUE\' | translate }}" />                    </div>                </div>            </li>        </ul>    </div>    <div class="modal-footer">        <button type="button" class="btn btn-warning" data-ng-click="vm.cancel()" translate>CANCEL_BTN</button>        <button type="button" class="btn btn-primary" data-ng-click="vm.save()" translate>OK_BTN</button>    </div></div>'; }