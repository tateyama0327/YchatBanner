(function(window, undefined) {
    var yahooChat = window.yahooChat || {};

    // iscroll関連
    yahooChat.iscrollFunc = {
        init : function(){
        }
    };

    // yahoo側の投稿制御
    yahooChat.yahooPostFunc = {
        init : function(options){
            $.extend(this, options);
            this.postFirst();
        },
        postFirst : function(){
            this.postMessage();
        },
        postMessage : function(){
            var self = this;
            var _talkData = {};
            _talkData.data = [];
            _talkData.data.push({
                isMytalk: false,
                contents: '何か悩みでもある？',
                time: '18:30'
            });
            this.$listsEl.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$messageTemplate.render(_talkData)
            );
        }
    };

    // ユーザーの投稿制御
    yahooChat.postFunc = {
        init : function(options){
            $.extend(this, options);
            this.setEvent();
        },
        setEvent : function(){
            var self = this;
            this.$btnEl.on('click',function(){
                //コメントを投稿
                self.postMessage();
            });
        },
        getEntryText : function(){
            //入力値を取得
            var _postComment = this.$textAreaEl.find('textarea').val();
            return _postComment;
        },
        postMessage : function(){
            var self = this;
            var _postComment = this.getEntryText();
            var _talkData = {};
            _talkData.data = [];
            _talkData.data.push({
                isMytalk: true,
                contents: _postComment,
                time: '18:30'
            });
            this.$listsEl.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$messageTemplate.render(_talkData)
            );
        }
    };

    yahooChat.stampFunc = {
        init : function(options){
            $.extend(this, options);
            this.setEvent();
        },
        setEvent : function(){
            var self = this;
            this.$btnEl.on('click',function(){
                self.showFeild();
            });
            this.$stampFeildEl.find('.stamp').on('click',function(){
                self.postStamp();
            });
        },
        showFeild : function(){
            this.$stampFeildEl.toggleClass('none');
        },
        postStamp : function(){
            var self = this;
            var _talkData = {};
            _talkData.data = [];
            _talkData.data.push({
                isMytalk: false,
                isStamp: true,
                contents: 'aaaaa',
                time: '18:30'
            });
            this.$listsEl.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$messageTemplate.render(_talkData)
            );
        }
    };

    window.yahooChat = yahooChat;
    $(function(){
        yahooChat.yahooPostFunc.init({
            $listsEl : $('#bubbleLists'),
            $messageTemplate : $('#talkDataTemplate')
        });
        yahooChat.postFunc.init({
            $btnEl : $('#postBtn'),
            $listsEl : $('#bubbleLists'),
            $textAreaEl : $('#textFeild'),
            $messageTemplate : $('#talkDataTemplate')
        });
        yahooChat.stampFunc.init({
            $btnEl : $('#plusBtn'),
            $stampFeildEl : $('#stampFeild'),
            $listsEl : $('#bubbleLists'),
            $messageTemplate : $('#talkDataTemplate')
        });
    });



    // jsRenderテスト
    // $(function(){

    //     var talkData = {
    //         data:[
    //             {isMytalk: false, contents: '何か悩みでもある？', time: '18:30'},
    //             {isMytalk: true, contents: 'あかん', time: '18:30'},
    //             {isMytalk: true, contents: 'あかん', time: '18:30'}
    //         ]
    //     };
    //     $('#bubbleLists').html(
    //         //テンプレートにデータを渡して、レンダリングする
    //         $('#talkDataTemplate').render(talkData)
    //     );

    // });

})(window);
