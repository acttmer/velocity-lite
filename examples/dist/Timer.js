function Timer(){
    this.start_time = new Date();
};

Timer.prototype.compileTime = function(){
    this.compile_end = new Date();
};

Timer.prototype.renderTime = function(){
    this.render_end = new Date();
};

Timer.prototype.consumeTime = function(){
    var that = this;
    return {
        compileTime : that.compile_end - that.start_time,
        renderTime : that.render_end - that.compile_end
    }    
}