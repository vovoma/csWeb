module Timeline {
    declare var vis;

    export interface ITimelineScope extends ng.IScope {
        vm: TimelineCtrl;
        numberOfItems: number;
        timeline: any;
    }

    export interface timelineItem {
        id: any;
        content: string;
        start: Date;
    }

    declare var vis;

    export class TimelineCtrl {
        private scope: ITimelineScope;
        private locale = "en-us";


        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            'layerService',
            'mapService',
            'messageBusService',
            'TimelineService'
        ];



        public focusDate: Date;
        public line1: string;
        public line2: string;
        public startDate: Date;
        public endDate: Date;
        public expanded: boolean = false;
        public timer: any;
        public isPlaying: boolean;
        public showControl: boolean;
        public isPinned: boolean;

        public options: any;
        public expandButtonBottom = 40;
        public items = new vis.DataSet();

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: ITimelineScope,
            private $layerService: csComp.Services.LayerService,
            private $mapService: csComp.Services.MapService,
            private $messageBusService: csComp.Services.MessageBusService,
            private TimelineService: Timeline.ITimelineService
            ) {
            this.loadLocales();



            this.options = {
                'width': '100%',
                "eventMargin": 0,
                "eventMarginAxis": (this.expanded) ? 65 : 0,
                'editable': false,
                'layout': 'box'
            };

            $scope.vm = this;

            this.initTimeline();

            this.$messageBusService.subscribe("timeline", (s: string, data: any) => { this.update(s, data) });


            this.$messageBusService.subscribe('feature', (s: string, feature: csComp.Services.IFeature) => {
                if (s === 'onFeatureSelect' && feature) {
                    if (this.ids.indexOf(feature.id) != -1) {
                        this.$scope.timeline.setSelection(feature.id);
                    }
                }
            });
            this.$messageBusService.subscribe("project", (s: string, data: any) => {
                setTimeout(() => {
                    this.updateFocusTime();
                    this.updateDragging();
                    this.myTimer();
                }, 0);

            });

            //$scope.focusDate = $layerService.project.timeLine.focusDate();

            // Options for the timeline

            this.$messageBusService.subscribe("language", (s: string, newLanguage: string) => {
                switch (s) {
                    case "newLanguage":
                        this.initTimeline();
                        break;
                }
            });
        }

        private update(s, data) {
            {
                switch (s) {
                    case "updateTimerange":
                        this.$scope.timeline.setWindow(data.start, data.end);
                        this.updateFocusTime();
                        break;
                    case "loadProjectTimeRange":
                        if (typeof this.$layerService.project === 'undefined'
                            || this.$layerService.project === null
                            || typeof this.$layerService.project.timeLine === 'undefined'
                            || this.$layerService.project.timeLine === null) return;
                        this.$scope.timeline.setWindow(this.$layerService.project.timeLine.start, this.$layerService.project.timeLine.end);
                        this.updateFocusTime();
                        break;
                    case "setFocus":
                        this.$scope.timeline.moveTo(data);
                        break;
                    case "updateFeatures":

                        console.log("timeline:updating features");
                        this.updateFeatures();

                        break;
                }
            }
        }

        private ids: string[] = [];

        private updateFeatures() {
            //this.items = [];
            //this.$scope.timeline.redraw();
            var temp: string[] = [];

            // check for new items
            this.$layerService.project.features.forEach((f: csComp.Services.IFeature) => {
                if (f.properties.hasOwnProperty('date')) {
                    temp.push(f.id);
                    if (this.ids.indexOf(f.id) === -1) {
                        var t = { id: f.id, group: 'all', content: f.properties['Name'], start: new Date(f.properties['date']) };
                        this.items.update(t);
                        this.ids.push(f.id);
                    }
                }
            });

            // check for old items
            this.ids.forEach((s) => {
                if (temp.indexOf(s) === -1) {
                    // remove item
                    var i = this.items.remove(s);
                    this.ids = this.ids.filter((t) => s != t);
                }
            })



            //this.$scope.timeline.setItems(i);
            this.$scope.timeline.redraw();


        }

        private initTimeline() {

            //var options = this.TimelineService.getTimelineOptions();
            // Configuration for the Timeline
            var options = {
                height: "150px"
            };
            //options.locale = this.$layerService.currentLocale;
            var container = document.getElementById('timeline');

            // Create a DataSet (allows two way data-binding)
            //this.items = new vis.DataSet([
            /*{ id: 1, content: 'item 1', start: '2014-04-20' },
            { id: 2, content: 'item 2', start: '2014-04-14' },
            { id: 3, content: 'item 3', start: '2014-04-18' },
            { id: 4, content: 'item 4', start: '2014-04-16', end: '2014-04-19' },
            { id: 5, content: 'item 5', start: '2014-04-25' },
            { id: 6, content: 'item 6', start: '2014-04-27', type: 'point' }*/
            //]);

            this.$layerService.timeline = this.$scope.timeline = new vis.Timeline(container, this.items, options);

            this.$layerService.timeline.redraw();
            /*vis.events.addListener(this.$scope.timeline, 'rangechange', _.throttle((prop) => this.onRangeChanged(prop), 200));
            vis.events.addListener(this.$scope.timeline, 'rangechange', () => {
                if (this.$layerService.project && this.$layerService.project.timeLine.isLive) {
                    this.myTimer();
                }
            });*/

            if (typeof this.$layerService.project !== 'undefined' && this.$layerService.project.timeLine !== null)
                this.$scope.timeline.setWindow(this.$layerService.project.timeLine.start, this.$layerService.project.timeLine.end);
            this.updateDragging();
            this.updateFocusTime();

            this.$scope.timeline.on('select', (properties) => {
                if (properties.items && properties.items.length > 0) {
                    var id = properties.items[0];
                    var f = this.$layerService.findFeatureById(id);
                    if (f) this.$layerService.selectFeature(f);
                }
            });

            this.$scope.timeline.addEventListener('rangechange', _.throttle((prop) => this.onRangeChanged(prop), 200));



        }

        public updateDragging() {
            if (this.$layerService.project && this.$layerService.project.timeLine.isLive) {
                (<any>$("#focustimeContainer")).draggable('disable');
            } else {
                (<any>$("#focustimeContainer")).draggable({
                    axis: "x",
                    containment: "parent",
                    drag: _.throttle(() => this.updateFocusTime(), 200)
                });
                (<any>$("#focustimeContainer")).draggable('enable');
            }
        }

        public expandToggle() {
            console.log('expanding timeline');
            this.expanded = !this.expanded;
            this.options.eventMarginAxis = (this.expanded) ? 65 : 0;
            this.expandButtonBottom = (this.expanded) ? 170 : 40;
            this.$layerService.timeline.setOptions(this.options);
            this.$layerService.timeline.redraw();
            // .config(TimelineServiceProvider => {
            // TimelineServiceProvider.setTimelineOptions({
            //     'width': '100%',
            //     "eventMargin": 0,
            //     "eventMarginAxis": 0,
            //     'editable': false,
            //     'layout': 'box'
            // });
        }


        public onRangeChanged(prop) {
            this.updateFocusTime();
        }

        public start() {
            this.stop();
            this.isPlaying = true;
            if (this.timer) this.timer = null;
            this.timer = setInterval(() => { this.myTimer(); }, 500);
        }

        public toggleLive() {
            if (!this.$layerService.project) return;
            this.stop();
            this.$layerService.project.timeLine.isLive = !this.$layerService.project.timeLine.isLive;
            this.isPlaying = false;
            if (this.$layerService.project.timeLine.isLive) {
                this.myTimer();
                this.start();
            }
            this.updateDragging();
            //this.isPlaying = this.isLive;
        }

        public myTimer() {
            var tl = this.$scope.timeline;
            if (this.$layerService.project.timeLine.isLive) {
                var pos = tl._toScreen(new Date());
                $("#focustimeContainer").css('left', pos - 75);
                this.updateFocusTime();
            } else if (this.isPlaying) {
                tl.move(0.005);
                this.updateFocusTime();
            }
        }

        public mouseEnter() {
            this.updateFocusTime();
            if (!isNaN(this.focusDate.getTime())) {
                this.showControl = true;
            }
        }

        public mouseLeave() {
            if (!this.isPlaying) this.showControl = false;
        }

        public pinToNow() {
            this.isPinned = true;
            this.start();
        }

        public stop() {
            this.isPlaying = false;
            if (this.timer) clearInterval(this.timer);

        }

        public updateFocusTime() {
            if (!this.$layerService.project) return;
            //if (!this.$mapService.timelineVisible) return;
            setTimeout(() => {
                var tl = this.$scope.timeline;
                tl.showCustomTime = true;

                tl.setCustomTime = typeof this.$layerService.project === 'undefined'
                    ? new Date()
                    : this.$layerService.project.timeLine.focusDate();

                //var end = $("#timeline").width;

                var range = this.$scope.timeline.getWindow();
                //tl.calcConversionFactor();
                var pos = $("#focustimeContainer").position().left + $("#focustimeContainer").width() / 2;

                if (this.$layerService.project.timeLine.isLive) {
                    this.focusDate = new Date();
                }
                else {
                    this.focusDate = new Date(this.$scope.timeline.screenToTime(pos + 3));
                }

                this.startDate = range.start; //new Date(range.start); //this.$scope.timeline.screenToTime(0));
                this.endDate = range.end; //new Date(this.$scope.timeline.screenToTime(end));

                if (this.$layerService.project != null && this.$layerService.project.timeLine != null) {
                    var projecttime = this.$layerService.project.timeLine;
                    projecttime.setFocus(this.focusDate, this.startDate, this.endDate);
                    var month = (<any>this.focusDate).toLocaleString(this.locale, { month: "long" });

                    switch (projecttime.zoomLevelName) {
                        case "decades":
                            this.line1 = this.focusDate.getFullYear().toString();
                            this.line2 = "";
                            break;
                        case "years":
                            this.line1 = this.focusDate.getFullYear().toString();
                            this.line2 = month;
                            break;
                        case "weeks":
                            this.line1 = this.focusDate.getFullYear().toString();
                            this.line2 = moment(this.focusDate).format('DD') + " " + month;
                            break;
                        case "milliseconds":
                            this.line1 = moment(this.focusDate).format('MM - DD - YYYY');
                            this.line2 = moment(this.focusDate).format('HH:mm:ss.SSS');
                            break;
                        default:
                            this.line1 = moment(this.focusDate).format('MM - DD - YYYY');
                            this.line2 = moment(this.focusDate).format('HH:mm:ss');
                    }
                }
                if (this.$scope.$$phase != '$apply' && this.$scope.$$phase != '$digest') { this.$scope.$apply(); }
                this.$messageBusService.publish("timeline", "focusChange", this.focusDate);
            }, 0);
            //this.$layerService.focusTime = new Date(this.timelineCtrl.screenToTime(centerX));
        }

        /**
        * Load the locales: instead of loading them from the original timeline-locales.js distribution,
        * add them here so you don't need to add another js dependency.
        * @seealso: http://almende.github.io/chap-links-library/downloads.html
        */
        loadLocales() {
            if (typeof vis === 'undefined') {
                vis = {};
                vis.locales = {};
            } else if (typeof vis.locales === 'undefined') {
                vis.locales = {};
            }
            // English ===================================================
            vis.locales['en'] = {
                'MONTHS': ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                'MONTHS_SHORT': ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                'DAYS': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                'DAYS_SHORT': ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                'ZOOM_IN': "Zoom in",
                'ZOOM_OUT': "Zoom out",
                'MOVE_LEFT': "Move left",
                'MOVE_RIGHT': "Move right",
                'NEW': "New",
                'CREATE_NEW_EVENT': "Create new event"
            };

            vis.locales['en_US'] = vis.locales['en'];
            vis.locales['en_UK'] = vis.locales['en'];
            // French ===================================================
            vis.locales['fr'] = {
                'MONTHS': ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
                'MONTHS_SHORT': ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"],
                'DAYS': ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
                'DAYS_SHORT': ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
                'ZOOM_IN': "Zoomer",
                'ZOOM_OUT': "Dézoomer",
                'MOVE_LEFT': "Déplacer à gauche",
                'MOVE_RIGHT': "Déplacer à droite",
                'NEW': "Nouveau",
                'CREATE_NEW_EVENT': "Créer un nouvel évènement"
            };

            vis.locales['fr_FR'] = vis.locales['fr'];
            vis.locales['fr_BE'] = vis.locales['fr'];
            vis.locales['fr_CA'] = vis.locales['fr'];
            // German ===================================================
            vis.locales['de'] = {
                'MONTHS': ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                'MONTHS_SHORT': ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
                'DAYS': ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                'DAYS_SHORT': ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
                'ZOOM_IN': "Vergrößern",
                'ZOOM_OUT': "Verkleinern",
                'MOVE_LEFT': "Nach links verschieben",
                'MOVE_RIGHT': "Nach rechts verschieben",
                'NEW': "Neu",
                'CREATE_NEW_EVENT': "Neues Ereignis erzeugen"
            };

            vis.locales['de_DE'] = vis.locales['de'];
            vis.locales['de_CH'] = vis.locales['de'];
            // Dutch =====================================================
            vis.locales['nl'] = {
                'MONTHS': ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
                'MONTHS_SHORT': ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
                'DAYS': ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
                'DAYS_SHORT': ["zo", "ma", "di", "wo", "do", "vr", "za"],
                'ZOOM_IN': "Inzoomen",
                'ZOOM_OUT': "Uitzoomen",
                'MOVE_LEFT': "Naar links",
                'MOVE_RIGHT': "Naar rechts",
                'NEW': "Nieuw",
                'CREATE_NEW_EVENT': "Nieuwe gebeurtenis maken"
            };

            vis.locales['nl_NL'] = vis.locales['nl'];
            vis.locales['nl_BE'] = vis.locales['nl'];
        }
    }
}
