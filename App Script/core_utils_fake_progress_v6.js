window.core_utils_fake_progress = function(opts) {
    const fake_progress = function (opts) {
        if (!opts) {
            opts = {};
        }
    
        this.timeConstant = opts.timeConstant || 1000;
        this.progress = 0;
        this._running = false;
        this._intervalFrequency = 100;
        this.autoStart = opts.autoStart || false;
        this.parent = opts.parent;
        this.parentStart = opts.parentStart;
        this.parentEnd = opts.parentEnd;
        if (this.autoStart) {
            this.start();
        }
    };

    fake_progress.prototype.start = function () {
        this._time = 0;
        this._intervalId = setInterval(this._onInterval.bind(this), this._intervalFrequency);
    };

    fake_progress.prototype._onInterval = function () {
        this._time += this._intervalFrequency;
        this.setProgress((1 - 0.0000000000000001) - Math.exp(-1 * this._time / this.timeConstant));
    };

    fake_progress.prototype.end = function () {
        this.stop();
        this.setProgress(1);
    };

    fake_progress.prototype.stop = function () {
        clearInterval(this._intervalId);
        this._intervalId = null;
    };

    fake_progress.prototype.createSubProgress = function (opts) {
        const parentStart = opts.start || this.progress;
        const parentEnd = opts.end || 1;
        const options = Object.assign({}, opts, {
            parent: this,
            parentStart: parentStart,
            parentEnd: parentEnd,
            start: null,
            end: null
        });
    
        const subProgress = new fake_progress(options);
        return subProgress;
    };

    fake_progress.prototype.setProgress = function (progress) {
        this.progress = progress;
        if (this.parent) {
            this.parent.setProgress(((this.parentEnd - this.parentStart) * this.progress) + this.parentStart);
        }
    };
    

    return new fake_progress(opts);
}