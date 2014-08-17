(function(window, undefined) {
    var yahooChat = window.yahooChat || {};

    // 画面の調整
    yahooChat.displayFunc = {
        init : function(options){
            $('html,body').animate({ scrollTop: 0 }, 'fast');
            // $.extend(this, options);
            // this.$contentEl.css( "height" , ($(window).height()-113) );
        }
    };


    // yahoo側の投稿制御
    yahooChat.yahooPostFunc = {
        init : function(options){
            this.appendCnt = 0;
            $.extend(this, options);
        },
        postMessage : function(options){
            var self = this;
            var _talkData = {};
            _talkData.data = [];
            _talkData.data.push({
                isStamp: options.isStamp,
                isMytalk: options.isMytalk,
                contents: options.contents,
                stampName: options.stampName,
                time: '18:30'
            });
            this.$output.append(
                //テンプレートにデータを渡して、レンダリングする
                self.$template.render(_talkData)
            );
            this.showAnime();
            this.appendCnt++;
        },
        showAnime : function(){
            if(this.appendCnt != 0){
                var _scrollEl = this.$output.find('.balloonShowAnime').eq(this.appendCnt).offset().top+100;
                $('html,body').animate({ scrollTop: _scrollEl }, 'fast');
                return false;
            }
        }
    };

    // ユーザーアンサーボタン制御
    yahooChat.answerBtnFunc = {
        init : function(options){
            $.extend(this, options);
        },
        choiceFirstComment : function(data){
            var self = this;
            var _renderData = {};
            _renderData.data = [];
            for(var i = 0, len = data.length; i < len; i++){

                _renderData.data.push({
                    isMytalk: false,
                    isStamp: true,
                    title: data[i]
                });
                this.$output.html(
                    //テンプレートにデータを渡して、レンダリングする
                    self.$template.render(_renderData)
                );
            }
            this.setEvent('choiceFirstComment');
            this.showFixedFeild();
        },
        choiceSecondComment : function(data){
            var self = this;
            var _renderData = {};
            _renderData.data = [];
            for(var i = 0, len = data.length; i < len; i++){

                _renderData.data.push({
                    isMytalk: false,
                    isStamp: true,
                    title: data[i],
                    isLike: i
                });
                this.$output.html(
                    //テンプレートにデータを渡して、レンダリングする
                    self.$template.render(_renderData)
                );
            }
            this.setEvent('choiceSecondComment');
            this.showFixedFeild();
        },
        choiceQuestion : function(data){
                var _rareQuestion = data.chatData.questionList.rareQuestion;
                var _triviaQuestion = data.chatData.questionList.triviaQuestion;
                var _seriousQuestion = data.chatData.questionList.seriousQuestion;

                var self = this;
                var _titleText = '';
                var _categoryText = '';
                var _renderData = {};
                _renderData.data = [];
                for(var i = 0, len = 3; i < len; i++){
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
            this.setEvent('choiceQuestion');
            this.showFixedFeild();
        },
        setEvent : function(choiceMode){
            var self = this;
            this.$btnFeildEl.off();
            this.$btnFeildEl.on('click',function(e){
                if(choiceMode === 'choiceQuestion'){
                    yahooChat.controlFunc.answerBtnClickFunc(e.target);
                }else if(choiceMode === 'choiceFirstComment'){
                    yahooChat.controlFunc.comment1BtnClickFunc(e.target);
                }else{
                    yahooChat.controlFunc.comment2BtnClickFunc(e.target);
                }
                self.hideFixedFeild();
            });
        },
        randomNum : function(max,min){
            //乱数生成(小数点あり)
            return Math.floor(Math.random()*(max-min)+min);
        },
        showFixedFeild : function(){
            // アンサーボタンステージの表示関数
            this.$fixedFeildEl.css('bottom','0px');
        },
        hideFixedFeild : function(){
            // アンサーボタンステージの表示関数
            console.warn('aaaa');
            this.$fixedFeildEl.css('bottom','-200px');
        },
        scrollPageFunc : function(){
        //ページ内スクロール
            var p = $(".content").eq(i).offset().top;
            $('html,body').animate({ scrollTop: p }, 'fast');
        }
    };


    // yahoo側自動chat制御系
    yahooChat.controlFunc = {
        init : function(options){
            $.extend(this, options);
            var self = this;
            //ループ時に使用するカウント
            this.loopCnt = 0;
            //jsonデータ読み込み
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
            var _setData = [
            {
                isMytalk: false,
                contents: data.chatData.ranger.red.talk[0].talkText
            }
            ];
            this.commentPostFunc(_setData,1500,function(){
                setTimeout(function(){
                    self.answerBtnFunc.choiceFirstComment(data.chatData.commentList.comment1);
                },1500);
            });
        },
        answerBtnClickFunc : function(target){
            //質問のチョイス
            var self = this;
            var _choiceData = this.jsonData.chatData.questionList[target.getAttribute('data-category')][target.getAttribute('data-num')];

            //後で使うのでオブジェクトルートにキャッシュ
            this.choiceData = _choiceData;

            var _setData = [
            {
                isMytalk: true,
                contents: _choiceData.content
            },
            {
                isMytalk: false,
                contents: self.jsonData.chatData.ranger.pink.talk[0].talkText
            },
            {
                isMytalk: false,
                contents: _choiceData.answer[0]
            }
            ];
            this.commentPostFunc(_setData,1500,function(){
                self.answerBtnFunc.choiceSecondComment(self.jsonData.chatData.commentList.comment2);
            });
        },
        comment1BtnClickFunc : function(target){
            //最初のユーザーとの掛け合い
            var self = this;
            var _setData = [
            {
                isMytalk: true,
                contents: target.innerHTML
            },
            {
                isMytalk: false,
                contents: self.jsonData.chatData.ranger.red.talk[1].talkText
            }
            ];
            this.commentPostFunc(_setData,1500,function(){
                self.answerBtnFunc.choiceQuestion(self.jsonData);
            });
        },
        comment2BtnClickFunc : function(target){
            //最後のユーザーとの掛け合い
            var self = this;
            var _choiceData = target.getAttribute('data-isLike');
            if(_choiceData === '0'){ //気に入った場合

                console.log('気に入った！');

            }else{ //気に食わなかった場合
                var _setData = [
                {
                    isMytalk: true,
                    isStamp: false,
                    contents: '気に食わない'
                },
                {
                    isMytalk: false,
                    isStamp: true,
                    stampName: 'stamp2'
                },
                {
                    isMytalk: false,
                    isStamp: false,
                    contents: 'そんな！ひどい。。'
                },
                {
                    isMytalk: false,
                    isStamp: false,
                    contents: 'この回答ならどうかしら！'
                }
                ];
                this.commentPostFunc(_setData,1500,function(){
                    self.commentDontLikeLoop();
                });
            }
        },
        commentDontLikeLoop : function(){
            var self = this;
            //第二アンサー以降を表示なければ終わりへ。
            if((this.choiceData.answer.length-1) != this.loopCnt){
                //ループをカウント
                this.loopCnt++;
                var _setData = [
                {
                    isMytalk: false,
                    isStamp: false,
                    contents: this.choiceData.answer[this.loopCnt]
                }
                ];
                this.commentPostFunc(_setData,1500,function(){
                    self.answerBtnFunc.choiceSecondComment(self.jsonData.chatData.commentList.comment2);
                });
            }else{
                console.warn('終わり！！！！！');
            }
        },
        commentLoopFunc : function(){
            var self = this;
            var _setData = [
            {
                isMytalk: false,
                isStamp: true,
                stampName: 'stamp2'
            },
            {
                isMytalk: false,
                isStamp: false,
                contents: 'まだ。。納得出来ないの(ノд・。) '
            },
            {
                isMytalk: false,
                isStamp: false,
                contents: 'この回答ならどうかしら！'
            }
            ];
            this.commentPostFunc(_setData,1500,function(){
                self.commentDontLikeLoop();
            });
        },
        commentPostFunc : function(optionList,sec,callback){
            //リストできたチャット情報を順番にながす。最後にcallbackを実行
            var _cnt = 0;
            var self = this;
            (function() {
                self.yahooFunc.postMessage({
                    isMytalk: optionList[_cnt].isMytalk,
                    isStamp: optionList[_cnt].isStamp,
                    stampName: optionList[_cnt].stampName,
                    contents: optionList[_cnt].contents
                });
                _cnt += 1;
                if (_cnt < optionList.length) {
                    setTimeout(arguments.callee, sec);
                }else{
                    callback();
                }
            })();
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
            $fixedFeildEl : $('.fixedFeild'),
            $btnFeildEl : $('.js_answerBtn'),
            $output : $('#out_textFeild'),
            $template : $('#tmpl_answerBtn')
        });

        //チャット制御系(コントローラー)
        yahooChat.controlFunc.init({
            yahooFunc : yahooChat.yahooPostFunc,
            answerBtnFunc : yahooChat.answerBtnFunc
        });

    });


})(window);
