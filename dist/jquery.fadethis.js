/*
 *  jQuery FadeThis - v1.0.4
 *  A lightweight, simple, yet powerful jQuery plugin for appear-as-you-scroll features.
 *  https://github.com/lwiesel/jquery-fadethis/
 *
 *  Made by lwiesel
 *  Under MIT License
 */
;(function ( $, window, document, undefined ) {
    // Defaults
    var _buffer = null,
        _watch  = [],
        $window = $(window),
        Plugin  = function() { }
    ;

    $.expr[":"].hasClassStartingWith = function(el, i, selector) {
        var re = new RegExp("\\b" + selector[3]);
        return re.test(el.className);
    };

    Plugin.prototype = {
        globals: {
            pluginName: "fadeThis",
            bufferTime: 300,
        },
        defaults: {
            baseName:       "slide-",
            speed:          500,
            easing:         "swing",
            offset:         0,
            reverse:        true,
            distance:       50,
            scrolledIn:     null,
            scrolledOut:    null
        },
        init: function ( elem, options ) {
            this.addElements( elem, options );

            this._setEvent();
            this._checkVisibleElements();
        },
        addElements: function ( elem, options ) {
            var element         = elem === document.body    ? window    : elem,
                $element        = element === window        ? $("body") : $(element),
                base            = this,
                classBaseName   = (options && options.baseName) ? options.baseName : this.defaults.baseName
            ;
            
            if (!$element.is(":hasClassStartingWith('" + classBaseName + "')")) {

                $element.find(":hasClassStartingWith('" + classBaseName + "')").each(function() {
                    base._addElement($(this), options);
                });
            } else {
                base._addElement($element, options);
            }

            return $element;
        },
        _addElement: function ($elem, options) {
            var metadata        = $elem.data( "plugin-options" ),
                localOptions    = $.extend({}, this.defaults, options, metadata),
                item = {
                    element:    $elem,
                    options:    localOptions,
                    invp:       false
                }
            ;

            _watch.push(item);

            this._prepareElement(item);

            return $elem;
        },
        _prepareElement: function (item) {
            var cssOptionsIn = {
                    opacity: 0,
                    visibility: "visible",
                    position: "relative"
                },
                direction = null
            ;

            if (item.element.hasClass(item.options.baseName + "right")) {
                direction = "left";
            } else if (item.element.hasClass(item.options.baseName + "left")) {
                direction = "right";
            } else if (item.element.hasClass(item.options.baseName + "top")) {
                direction = "bottom";
            } else if (item.element.hasClass(item.options.baseName + "bottom")) {
                direction = "top";
            } else {
                return false;
            }

            cssOptionsIn[direction] = item.options.distance;

            item.element.css(cssOptionsIn);
        },
        _setEvent: function () {
            var base = this;

            $window.on("scroll", function(e) {
                if(!_buffer) {
                    _buffer = setTimeout(function(){
                        base._checkVisibleElements( e );
                        _buffer = null;
                    }, base.globals.bufferTime);
                }
            });
        },
        _checkVisibleElements: function( e ) {
            var base = this;

            $.each(_watch, function(key, item){
                if (base._isVisible(item)) {
                    if ( !item.invp ) {
                        item.invp = true;
                        base._triggerFading(item);
                        if ( item.options.scrolledIn ) {
                            item.options.scrolledIn.call( item.element, e );
                        }
                        item.element.trigger("fadethisscrolledin", e);
                    }
                } else if ( item.invp ) {
                    item.invp = false;
                    if ( item.options.reverse ) {
                        base._triggerFading(item, false);
                    }
                    if ( item.options.scrolledOut ) {
                        item.options.scrolledOut.call( item.element, e );
                    }
                    item.element.trigger("fadethisscrolledout", e);
                }
            });
        },
        _isVisible: function(item) {
            var docViewTop      = $window.scrollTop() + item.options.offset,
                docViewBottom   = docViewTop + $window.height() - 2 * item.options.offset,
                elemTop         = item.element.offset().top,
                elemBottom      = elemTop + item.element.height()
            ;

            return ((elemBottom >= docViewTop) &&  (elemTop <= docViewBottom) &&  (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop));
        },
        _triggerFading:function (item, appear) {
            appear = typeof appear !== "undefined" ? appear : true;

            var stateAnimIn = {
                    opacity: 1
                },
                stateAnimOut = {
                    opacity: 0,
                },
                direction = null
            ;

            if (item.element.hasClass(item.options.baseName + "right")) {
                direction = "left";
            } else if (item.element.hasClass(item.options.baseName + "left")) {
                direction = "right";
            } else if (item.element.hasClass(item.options.baseName + "top")) {
                direction = "bottom";
            } else if (item.element.hasClass(item.options.baseName + "bottom")) {
                direction = "top";
            } else {
                return false;
            }

            stateAnimIn[direction]  = 0;
            stateAnimOut[direction] = item.options.distance;


            if (appear) {
                item.element.stop(true).animate(stateAnimIn, item.options.speed, item.options.easing);
            } else {
                item.element.stop(true).animate(stateAnimOut, item.options.speed, item.options.easing);
            }
        }
    };

    Plugin.defaults = Plugin.prototype.defaults;
    Plugin.globals  = Plugin.prototype.globals;

    window.Plugin = new Plugin();

    // Preventing against multiple instantiations for the same DOM element
    $.fn[ Plugin.globals.pluginName ] = function ( options ) {
        this.each(function() {
            if ( !$.data( window, "plugin_" + Plugin.globals.pluginName ) ) {
                $.data( window, "plugin_" + Plugin.globals.pluginName, "set" );
                $.data( this, "plugin_" + Plugin.globals.pluginName, window.Plugin.init( this, options ) );
            } else if ( !$.data( this, "plugin_" + Plugin.globals.pluginName )) {
                $.data( this, "plugin_" + Plugin.globals.pluginName, window.Plugin.addElements( this, options ) );
            }
        });

        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );
