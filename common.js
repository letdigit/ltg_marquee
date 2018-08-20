"use strict";

const _checkOptions          = Symbol('checkOptions');
const _createMarquee         = Symbol('createMarquee');
const _setDimensions         = Symbol('setDimensions');
const _assemblyContainer     = Symbol('assemblyContainer');
const _makeClone             = Symbol('makeClone');
const _wrap                  = Symbol('wrap');
const _setupListeners        = Symbol('setupListeners');
const _render                = Symbol('render');
const _handleEvents          = Symbol('handleEvents');
const _setupAnimation        = Symbol('setupAnimation');



class Marquee {
    constructor(options) {
        this.element = document.querySelector(`.${options.elementClass}`);

        this.direction      = options.direction || 'left';
        this.speed          = options.speed     || 1;
        this.interval       = options.interval  || 0;
        this.position       = 0;
        
        this.running = false;
        this.paused = false;

        if (this[_checkOptions]()) this[_createMarquee]();
    }
    

    // Initialization
    [_checkOptions]() {
        this.errors = []

        if (typeof this.direction != 'string' || this.direction != 'left' && this.direction != 'right') {
            let message = "Direction value must be 'right' or 'left' and not a numerical!";
            this.errors.push(message)
        }

        if (typeof this.speed != 'number' || this.speed > 8) {
            let message = "Maximum speed value is: 8.";
            this.errors.push(message)
        }

        if (typeof this.interval != 'number' || this.interval > 5000) {
            let message = "Maximum interval is: 5s.";
            this.errors.push(message)
        }

        if (this.errors.length > 0) {
            throw new TypeError(this.errors.forEach((error) => {
                console.error(error)
            }));
        }

        return true
    }

    [_createMarquee]() {
        this[_setDimensions]();
        this[_assemblyContainer]();
        this[_makeClone]();
        this[_wrap]();
        this[_setupListeners]();
        this[_setupAnimation]();
    }


    // Setup methods
    [_setDimensions]() {
        this.blocks = this.element.querySelectorAll('.marquee-block');
        this.width = (this.blocks.length / 2) * this.blocks[0].offsetWidth;

        if (this.interval && this.width <= this.element.offsetWidth) {
            this.indent = this.interval + (this.element.offsetWidth - this.width);
        }

        if (!this.interval && this.width <= this.element.offsetWidth) {
            this.indent = this.element.offsetWidth - this.width;
        }

    }

    [_assemblyContainer]() {
        this.container = document.createElement('div');
        this.container.innerHTML = this.element.innerHTML;
        this.container.style.cssText = "display: block; position: absolute; overflow: hidden;";
        this.container.style.width = `${this.width * 2}px`;
    }

    [_makeClone]() {
        this.duplicate = this.container.cloneNode(true);

        if (this.direction == 'right') {
            this.duplicate.style.left = '100%';
            this.duplicate.style.marginLeft = `${this.indent}px`;
        }
        else if (this.direction == 'left') {
            this.duplicate.style.right = '100%';
            this.duplicate.style.marginRight = `${this.indent}px`;
        }
    }

    [_wrap]() {
        this.wrapper = document.createElement('div');
        this.element.innerHTML = null;
        this.wrapper.classList.add('wrapper');
        this.wrapper.appendChild(this.container);
        this.wrapper.appendChild(this.duplicate);
        this.element.appendChild(this.wrapper);
    }

    [_setupListeners]() {
        this.wrapper.addEventListener('mouseenter', (e) => {
            if (this.running) this[_handleEvents](e);
        })

        this.wrapper.addEventListener('mouseleave', (e) => {
            if (this.running) this[_handleEvents](e);
        })

        window.addEventListener('resize', (e) => {
            if (this.running) this[_handleEvents](e)
        })
    }

    [_setupAnimation]() {
        if (this.direction == 'left') {
            this.updPosition = () => {
                this.position += this.speed;
            }
            this.rstPosition = () => {
                this.xPos = this.element.children[0].lastElementChild.getBoundingClientRect().x;
                return this.xPos >= 0;
            }
        }
        else if (this.direction == 'right') {
            this.updPosition = () => {
                this.position -= this.speed;
            }
            this.rstPosition = () => {
                this.xPos = this.element.children[0].lastElementChild.getBoundingClientRect().x;
                return this.xPos <= 0;
            }
        }

        this.renderPosition = () => {
            this.wrapper.style.transform = `translateX(${this.position}px)`;
        }

        this.checkPosition = () => {
            if (this.rstPosition()) this.position = 0;
        }
    }


    // Live methods
    [_render]() {
        this.checkPosition();
        this.renderPosition();
        this.updPosition();
    }

    [_handleEvents](e) {
        if (e.type == 'mouseenter' && e.isTrusted) {
            this.paused = true;
            this.wrapper.parentNode.classList.toggle('paused');
            this.wrapper.parentNode.classList.remove('running');
        } else if (e.type == 'mouseleave' && e.isTrusted) {
            this.paused = false;
            this.wrapper.parentNode.classList.add('running');
            this.wrapper.parentNode.classList.remove('paused');
        } else if (e.type == 'resize' && e.isTrusted) {
            this[_setDimensions]();
            this.element.children[0].lastElementChild.style.marginRight = `${this.indent}px`;
            // this.element.children[0].lastElementChild.style.marginLeft = `${this.indent}px`;


        }
    }


    // Public methods
    start() {
        this.running = true;
        this.wrapper.parentNode.classList.add('running');

        this.process = setInterval(() => {
            if (!this.paused) this[_render]();
        }, this.speed);
    }

    stop() {
        clearInterval(this.process);
        this.wrapper.parentNode.classList.add('stoped');
    }

    destroy() {
        this.buffer = this.container.innerHTML;
        this.element.innerHTML = null;
        this.element.innerHTML = this.buffer;
    }


}

var marquee = new Marquee({
    elementClass: 'marquee',
    // speed: 20,
    // direction: 'right',
    // interval: 9000
});

marquee.start();
// marquee.destroy();
