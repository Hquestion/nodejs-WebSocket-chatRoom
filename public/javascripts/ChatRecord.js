var ChatRecord = function(user, content, type, isSelf){
    this.user = user;
    this.content = content;
    this.type = type || 'TEXT';
    this.isSelf = !!isSelf;
    this.$template = $('<div class="chat-record"><div class="user-name"></div><div class="user-input"></div></div>');
    if(this.isSelf) {
        this.template.addClass('self');
    }
};

ChatRecord.prototype.init = function(){
    this.$template.find('.user-name').text(this.user);
    var $inputView = this.$template.find('.user-input');
    if(this.type === 'TEXT') {
        $inputView.text(this.content);
    }else if(this.type === 'IMAGE') {
        var $img = $('<img>');
        $img.attr('src', this.content);
        $inputView.appendChild($img);
    }else if(this.type === 'VIDEO') {
        var $video = $('<video>');
        $img.attr('src', this.content);
        $inputView.appendChild($img);
    }
};

ChatRecord.prototype.render = function($container){
    this.$template.appendTo($container);
};