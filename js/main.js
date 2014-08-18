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

    // イントロ部分
    yahooChat.introFunc = {
        init : function(options){
            $.extend(this, options);
            this.setEvent();
        },
        setEvent : function(){
            var self = this;
            this.$fixedBanner.on('click',function(){
                self.$yahooHome.addClass('alphaHideAnime');
                self.$yahooHome.on('webkitAnimationEnd',function(){
                    self.$yahooHome.remove();
                    self.$displayWrap.addClass('alphaShowAnime');
                        //チャット制御系(コントローラー)
                        yahooChat.controlFunc.init({
                            yahooFunc : yahooChat.yahooPostFunc,
                            answerBtnFunc : yahooChat.answerBtnFunc
                        });
                });
            });
        },
    };

    // yahoo側の投稿制御
    yahooChat.yahooPostFunc = {
        init : function(options){
            this.appendCnt = 0;
            this.balloonSumHeight = 89;
            $.extend(this, options);
        },
        postMessage : function(options){
            var self = this;
            var _talkData = {};
            _talkData.data = [];

            //時間表示用
            var now = new Date();
            var hour = now.getHours(); // 時
            var min = now.getMinutes(); // 分
            if(hour < 10) { hour = "0" + hour; }
            if(min < 10) { min = "0" + min; }
            
            _talkData.data.push({
                isStamp: options.isStamp,
                isMytalk: options.isMytalk,
                contents: options.contents,
                stampName: options.stampName,
                time: hour + ':' + min,
                rangerName: options.rangerName,
                rangerColor: options.rangerColor
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
                this.balloonSumHeight += this.$output.find('.balloonShowAnime').eq(this.appendCnt).outerHeight(true);
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
                    var _rareQrandomNum = this.randomNum(7,0);
                    var _triviaQrandomNum = this.randomNum(3,0);
                    var _seriousQrandomNum = this.randomNum(4,0);
                    var _randomNum;
                    if(i === 0){
                        _titleText = _rareQuestion[_rareQrandomNum].title;
                        _categoryText = 'rareQuestion';
                        _randomNum = _rareQrandomNum;
                    }else if(i === 1){
                        _titleText = _triviaQuestion[_triviaQrandomNum].title;
                        _categoryText = 'triviaQuestion';
                        _randomNum = _triviaQrandomNum;
                    }else{
                        _titleText = _seriousQuestion[_seriousQrandomNum].title;
                        _categoryText = 'seriousQuestion';
                        _randomNum = _seriousQrandomNum;
                    }
                    _renderData.data.push({
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
            this.$fixedFeildEl.css('bottom','0px');
            var _feildHeight = this.$fixedFeildEl.outerHeight(true);
            this.$bubbleListsEl.css('height',_feildHeight+yahooChat.yahooPostFunc.balloonSumHeight+'px');
        },
        hideFixedFeild : function(){
            // アンサーボタンステージの表示関数
            this.$fixedFeildEl.css('bottom','-200px');
            this.$bubbleListsEl.css('height','auto');
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
                rangerName: 'レッド',
                rangerColor: 'red',
                contents: 'オッス！オラ！Yahoo! レッド！'
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
            var _choiceData = this.jsonData.chatData.questionList[target.parentNode.getAttribute('data-category')][target.parentNode.getAttribute('data-num')];

            //後で使うのでオブジェクトルートにキャッシュ
            this.choiceData = _choiceData;

            var _setData = [
            {
                isMytalk: true,
                contents: _choiceData.content
            },
            {
                isMytalk: false,
                contents: 'ピンクにまかせて♥︎',
                rangerName: 'ピンク',
                rangerColor: 'pink'
            },
            {
                isMytalk: false,
                isStamp: true,
                stampName: 'pink_good',
                rangerName: 'ピンク',
                rangerColor: 'pink'
            },
            {
                isMytalk: false,
                contents: _choiceData.answer[0],
                rangerName: 'ピンク',
                rangerColor: 'pink'
            }
            ];
            this.commentPostFunc(_setData,1500,function(){
//                setTimeout(function(){
                    self.answerBtnFunc.choiceSecondComment(self.jsonData.chatData.commentList.comment2);
//                },1500);
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
                contents: 'オラを呼んだってことは、なんか悩みあるんじゃねーのか？どんな悩みでも、俺たちヤフレンジャーが答えを導くぜっ！',
                rangerName: 'レッド',
                rangerColor: 'red'
            }
            ];
            this.commentPostFunc(_setData,1500,function(){
                self.answerBtnFunc.choiceQuestion(self.jsonData);
            });
        },
        comment2BtnClickFunc : function(target){
            //最後のユーザーとの掛け合い
            var self = this;
            var _choiceData = target.parentNode.getAttribute('data-isLike');
            if(_choiceData === '0'){ //気に入った場合

                var _setData = [
                {
                    isMytalk: true,
                    isStamp: false,
                    contents: '気にいった'
                }
                ];
                this.commentPostFunc(_setData,1500,function(){
                    setTimeout(function(){
                        self.LoopEndFunc('like');
                    },1500);
                });


            }else{ //気に食わなかった場合

                var _setData = [
                {
                    isMytalk: true,
                    isStamp: false,
                    contents: '気に食わない'
                }
                ];
                this.commentPostFunc(_setData,1500,function(){
                    setTimeout(function(){
                        self.commentDontLikeLoop();
                    },1500);
                });

            }
        },
        commentDontLikeLoop : function(){
            var self = this;
            //第二アンサー以降を表示なければ終わりへ。
            if((this.choiceData.answer.length-1) != this.loopCnt){
                //ループをカウント
                this.loopCnt++;
                if(this.loopCnt === 1){
                    var _setData = [
                    {
                        isMytalk: false,
                        isStamp: false,
                        contents: 'そんな！ひどい。。',
                        rangerName: 'ピンク',
                        rangerColor: 'pink'
                    },
                    {
                        isMytalk: false,
                        isStamp: false,
                        contents: 'ワンワン！（おじさんの回答に任せるんだ）',
                        rangerName: 'ホワイト',
                        rangerColor: 'white'
                    },
                    {
                        isMytalk: false,
                        isStamp: true,
                        stampName: 'white_good',
                        rangerName: 'ホワイト',
                        rangerColor: 'white'
                    },
                    {
                        isMytalk: false,
                        isStamp: false,
                        contents: 'ワンワン('+this.choiceData.answer[this.loopCnt]+')',
                        rangerName: 'ホワイト',
                        rangerColor: 'white'
                    }
                    ];
                    this.commentPostFunc(_setData,1500,function(){
                        self.answerBtnFunc.choiceSecondComment(self.jsonData.chatData.commentList.comment2);
                    });
                }else{
                    var _setData = [
                    {
                        isMytalk: false,
                        isStamp: false,
                        contents: 'クゥーン。。（そりゃないぜ）',
                        rangerName: 'ホワイト',
                        rangerColor: 'white'
                    },
                    {
                        isMytalk: false,
                        isStamp: false,
                        contents: 'オレ オマエノ ナヤミ ナクシテヤル！',
                        rangerName: 'グリーン',
                        rangerColor: 'green'
                    },
                    {
                        isMytalk: false,
                        isStamp: true,
                        stampName: 'green_good',
                        rangerName: 'グリーン',
                        rangerColor: 'green'
                    },
                    {
                        isMytalk: false,
                        isStamp: false,
                        contents: this.choiceData.answer[this.loopCnt],
                        rangerName: 'グリーン',
                        rangerColor: 'green'
                    }
                    ];
                    this.commentPostFunc(_setData,1500,function(){
                        self.answerBtnFunc.choiceSecondComment(self.jsonData.chatData.commentList.comment2);
                    });
                }
            }else{
                var _setData = [
                {
                    isMytalk: false,
                    isStamp: false,
                    contents: 'オレ オマエ スクエナイ。。',
                    rangerName: 'グリーン',
                    rangerColor: 'green'
                }
                ];
                this.commentPostFunc(_setData,1500,function(){
                    setTimeout(function(){
                        self.LoopEndFunc('dontLike');
                    },1500);
                });
            }
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
                    contents: optionList[_cnt].contents,
                    rangerName: optionList[_cnt].rangerName,
                    rangerColor: optionList[_cnt].rangerColor
                });
                _cnt += 1;
                if (_cnt < optionList.length) {
                    setTimeout(arguments.callee, sec);
                }else{
                    callback();
                }
            })();
        },
        LoopEndFunc : function(type){
            var self = this;
            var _isLike;
            if(type === 'like'){
                switch (this.loopCnt){
                  case 0:
                    var stampRanger = 'pink_funny';
                    break;
                  case 1:
                    var stampRanger = 'white_funny';
                    break;
                  case 2:
                    var stampRanger = 'green_funny';
                    break;
                  default:
                    break;
                }
                _isLike = true;
                var _setData = [
                {
                    isMytalk: false,
                    isStamp: true,
                    stampName: stampRanger
                },
                {
                    isMytalk: false,
                    rangerName: 'レッド',
                    rangerColor: 'red',
                    contents: '君の悩みに、我々の知恵が貸せてよかった！'
                }
                ];
            }else{
                _isLike = false;
                var _setData = [
                {
                    isMytalk: false,
                    rangerName: 'ブルー',
                    rangerColor: 'blue',
                    contents: '残念だ…俺達って、ふがいねえな…'
                }
                ];
            }
            this.commentPostFunc(_setData,1500,function(){
                setTimeout(function(){
                    yahooChat.endingFunc.init({
                        $displayWrap : $('.displayWrap'),
                        $lastCut : $('#lastCut'),
                        isLike : _isLike
                    });
                },3000);
            });
        }
    };

    // エンディング画面
    yahooChat.endingFunc = {
        init : function(options){
            $.extend(this, options);
            var likeType = this.isLike?1:0;
            this.$lastCut.find('img').eq(likeType).addClass('none');
            this.displayChange();
        },
        displayChange : function(){
            var self = this;
            this.$lastCut.removeClass('none');
            this.$displayWrap.removeClass('alphaShowAnime');
            this.$displayWrap.addClass('alphaHideAnime');
            this.$displayWrap.on('webkitAnimationEnd',function(){
                self.setLocationEvent();
            });
        },
        setLocationEvent : function(){
            setTimeout(function(){
                location.href = 'http://m.chiebukuro.yahoo.co.jp/'
            },5000);
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
            $bubbleListsEl : $('#bubbleLists'),
            $btnFeildEl : $('.js_answerBtn'),
            $output : $('#out_textFeild'),
            $template : $('#tmpl_answerBtn')
        });

        // チャットイントロ部分
        yahooChat.introFunc.init({
            $displayWrap : $('.displayWrap'),
            $yahooHome : $('.yahooHome'),
            $fixedBanner : $('.fixedBanner')
        });

    });

})(window);
