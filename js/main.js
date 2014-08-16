﻿(function(window, undefined) {
    var yahooChat = window.yahooChat || {};

    // 画面の調整
    yahooChat.displayFunc = {
        init : function(options){
            $.extend(this, options);
            this.$contentEl.css( "height" , ($(window).height()-113) );
        }
    };

    // yahoo側の投稿制御
    yahooChat.yahooPostFunc = {
        init : function(options){
            $.extend(this, options);
        },
        postMessage : function(options){
            var self = this;
            var _talkData = {};
            _talkData.data = [];
            _talkData.data.push({
                isMytalk: options.isMytalk,
                contents: options.contents,
                time: '18:30'
            });
            this.$output.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$template.render(_talkData)
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
            this.$output.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$template.render(_talkData)
            );
        }
    };
    // スタンプ投稿制御
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
            this.$output.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$template.render(_talkData)
            );
        }
    };
    // 
    yahooChat.answerBtnFunc = {
        init : function(options){
            $.extend(this, options);
        },
        postAnswer : function(data){
            var _rareQuestion = data.chatData.questionList.rareQuestion;
            var _triviaQuestion = data.chatData.questionList.triviaQuestion;
            var _seriousQuestion = data.chatData.questionList.seriousQuestion;

            var self = this;
            var _titleText = '';
            var _categoryText = '';
            var _renderData = {};
            _renderData.data = [];
            for(var i = 0, len = 3; i < 3; i++){
                var _randomNum = this.randomNum(3,0);
                if(i === 0){
                    _titleText = _rareQuestion[_randomNum].title;
                    _categoryText = 'rareQuestion';
                }else if(i === 1){
                    _titleText = _triviaQuestion[_randomNum].title;
                    _categoryText = 'triviaQuestion';
                }else{
                    _titleText = _seriousQuestion[_randomNum].title;
                    _categoryText = 'seriousQuestion';
                }
                _renderData.data.push({
                    isMytalk: false,
                    isStamp: true,
                    title: _titleText,
                    category: _categoryText,
                    dataNum: _randomNum
                });
            }
            this.$output.html(
                //テンプレートにデータを渡して、レンダリングする
                self.$template.render(_renderData)
            );
            this.setEvent();
        },
        setEvent : function(){
            this.$btnFeildEl.on('click',function(e){
               yahooChat.controlFunc.answerBtnClickFunc(e.target);
            });
        },
        randomNum : function(max,min){
            //乱数生成(小数点あり)
            return Math.floor(Math.random()*(max-min)+min);
        }
    };

    // yahoo側自動chat制御系
    yahooChat.controlFunc = {
        init : function(options){
            $.extend(this, options);
            var self = this;
            this.getJson(function(){
                //最初のchat呼び出し
                self.firstChat(self.jsonData);
            });
        },
        getJson : function(callback){
            var self = this;
            $.getJSON("chatData.json", function(data){
                self.jsonData = data;
                callback();
            });
        },
        firstChat : function(data){
            var self = this;
            this.postTimeFunc(function(){
                self.yahooFunc.postMessage({
                    isMytalk: false,
                    contents: data.chatData.ranger.red.talk[0].talkText
                });
            },500,function(){
                self.answerBtnFunc.postAnswer(data);
            });
        },
        postTimeFunc : function(func,sec,callback){
            setTimeout(function(){
                func();
                setTimeout(function(){
                    callback();
                },sec);
            },sec);
        },
        answerBtnClickFunc : function(target){
            var self = this;
            var _choiceData = this.jsonData.chatData.questionList[target.getAttribute('data-category')][target.getAttribute('data-num')];
            //ヤフレンジャーのだれかが言葉を話す。
            this.postTimeFunc(function(){
                self.yahooFunc.postMessage({
                    isMytalk: false,
                    contents: self.jsonData.chatData.ranger.pink.talk[0].talkText
                });
            },500,function(){
                self.yahooFunc.postMessage({
                    isMytalk: false,
                    contents: _choiceData.answer
                });
            });
        }
    };


    window.yahooChat = yahooChat;
    $(function(){

        // 端末の画面幅によって表示幅変更
        yahooChat.displayFunc.init({
            $contentEl : $('#bubbleLists')
        });

        //yahoo側のチャット制御
         yahooChat.yahooPostFunc.init({
            $output : $('#bubbleLists'),
            $template : $('#talkDataTmpl')
        });

        //アンサーボタン制御
        yahooChat.answerBtnFunc.init({
            $btnFeildEl : $('.js_answerBtn'),
            $output : $('#out_textFeild'),
            $template : $('#tmpl_answerBtn')
        });

        //チャット制御系(コントローラー)
        yahooChat.controlFunc.init({
            yahooFunc : yahooChat.yahooPostFunc,
            answerBtnFunc : yahooChat.answerBtnFunc
        });

        // yahooChat.postFunc.init({
        //     $btnEl : $('#postBtn'),
        //     $output : $('#bubbleLists'),
        //     $textAreaEl : $('#textFeild'),
        //     $template : $('#talkDataTmpl')
        // });
        // yahooChat.stampFunc.init({
        //     $btnEl : $('#plusBtn'),
        //     $stampFeildEl : $('#stampFeild'),
        //     $output : $('#bubbleLists'),
        //     $template : $('#talkDataTmpl')
        // });

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
