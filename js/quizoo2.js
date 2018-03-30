/*
 * Created by Chris Chudleigh
 */

var myOutput = document.querySelector('.quizMessage');
var quiz1Form = document.getElementById('quiz1Form');
quiz1Form.style.visibility = "hidden";

ajaxCall("./js/questions-new.js", myOutput, function (data) {

    Handlebars.registerHelper("arrayLength", function () {
        return (10);
    });
    
    function startQuiz(quiz, quizForm) {
		function shuffle(array) {
			console.log('shuffle');
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() *   currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
		// randomise questions 
    shuffle(quiz.qtns);
    for (var i = 0; i < 30; i++) {
        quiz.qtns[i].number = i + 1;
    }
        var dirtn;
        var countdown;
        function resetQuiz() {
            countdown = 5 * 60 * 1000;
            timerId = setInterval(function () {
                countdown -= 1000;
                var min = Math.floor(countdown / (60 * 1000));
                var sec = Math.floor((countdown - (min * 60 * 1000)) / 1000);  //correct
                if (countdown <= 0) {
                    alert("Time up!");
                    clearInterval(timerId);
                    quiz.qtnNumber = 10;
                    dirtn = "right";
                    //console.log("cd=" + countdown);
                    nextQtn(quiz, quizForm, dirtn, countdown);
                } else {
                    $("#countTime").html("Time remaining: " + min + ":" + (sec < 10 ? "0" : "") + sec);
                }

            }, 1000); 
            myAction.style.display = "none";
        }
		var myAction = document.querySelector('#' + quizForm.id + ' #myAction');
        myAction.style.display = "none";
        
        var myStart = document.querySelector('#' + quizForm.id + ' #myStart');
        myStart.innerHTML = "Start!";
        
        $('.card').css('visibility', 'hidden');
        myStart.onclick = function () {
            resetQuiz();
            nextQtn(quiz, quizForm, dirtn, countdown);
            myStart.style.display = "none";
            var mySwipeContent = document.querySelector('#appContent .content');
            var hammertime = new Hammer(mySwipeContent);
            hammertime.get('swipe').set({ velocity: 0.1, threshold: 5, domEvents: true });
            hammertime.on("swipeleft", Cowboy.debounce(250, function () {
                dirtn = "left";
                nextQtn(quiz, quizForm, dirtn, countdown);
            }));
            hammertime.on("swiperight", Cowboy.debounce(250, function () {
                dirtn = "right";
                if (quiz.qtnNumber !== 1) { prevQtn(quiz, quizForm, dirtn) };
            }));
        }
		myAction.onclick = function () {
		        for (var i = 0; i < 10; i++) {
		            quiz.qtns[i].userChoice = 0;
		        }
		        quiz.qtnNumber = 0;
				
		shuffle(quiz.qtns);
    for(var j = 0; j < 30; j++) {
        quiz.qtns[j].number = j + 1;
		console.log(j);
    };
		        resetQuiz();
		        nextQtn(quiz, quizForm, dirtn, countdown);
		};
    }//ftn 

    function prevQtn(quiz, quizForm, dirtn) {
        var quizError = document.querySelector('#' + quizForm.id + ' .quizError');
        var quizQuestion = document.querySelector('#' + quizForm.id + ' .quizQuestion');
        //check to see if quiz to be reset ie. on result page
        if (quiz.qtnNumber > 10) {
            return true;
        }
        quizError.style.display = "none";
        if (quiz.qtnNumber !== 1 || quiz.qtnNumber !== 10) {
            for (var i = 0; i < quizForm.elements.myAnswer.length; i++) {
                if (quizForm.elements["myAnswer"][i].checked) {
                    quiz.qtns[quiz.qtnNumber - 1].userChoice = i + 1;
                }//if
            }//for
            quiz.qtnNumber--;
            quiz.writeQuestion(quiz.qtnNumber, quizQuestion,dirtn);
        }//if
    }//ftn

    function nextQtn(quiz, quizForm, dirtn,countdown) {
        var quizError = document.querySelector('#' + quizForm.id + ' .quizError');
        var quizAnswers = document.querySelector('#' + quizForm.id + ' .quizAnswers');
        var quizQuestion = document.querySelector('#' + quizForm.id + ' .quizQuestion');
        quizError.style.display = "none";

        //check to see if quiz to be reset ie. on result page
        if (quiz.qtnNumber > 10) {
            for (var i = 0; i < 10; i++) {
                quiz.qtns[i].userChoice = 0;
            }
            quiz.qtnNumber = 0;
            startQuiz(quiz, quizForm);
            return true;
        }//if

        // add users selection to userChoices
        if (quiz.qtnNumber !== 0 && (countdown>0) ) {
            if (!checkRadio(quizForm)) {
                quizError.style.display = "block";
                quizError.innerHTML = "Please select a choice above!";
                return false;
            };
            for (var i = 0; i < quizForm.elements.myAnswer.length; i++) {
                if (quizForm.elements["myAnswer"][i].checked) {
                    quiz.qtns[quiz.qtnNumber - 1].userChoice = i + 1;
                }//if
            }//for
        }//if

        quiz.qtnNumber++;
        quizAnswers.innerHTML = "";

        //write out next set of answers if not at end of quiz else write score
        if (quiz.qtnNumber <= 10) {
            quiz.writeQuestion(quiz.qtnNumber, quizQuestion,dirtn);
            }//if
        else {
            quiz.writeScore(quizQuestion);
            quiz.writeResult(quiz, quizAnswers);
            clearInterval(timerId);
			var myAction = document.querySelector('#' + quizForm.id + ' #myAction');
            myAction.style.display = "inline-block";
            myAction.innerHTML = "Try again!";
        }//else
        return true;
    }//ftn

    //check if user has selected a checkbox
    function checkRadio(myForm) {
        for (var i = 0; i < myForm.elements["myAnswer"].length; i++) {
            if (myForm.elements["myAnswer"][i].checked) return true;
        }//for
        return false;
    }//ftn

    // Quiz constructor
    function Quiz(name, qtns, qtnNumber) {
        this.name = name;
        this.qtns = qtns;
        this.qtnNumber = qtnNumber;
        Quiz.prototype.writeQuestion = function (qtnNumber, qtnTarget, dirtn) {
            //console.log(dirtn);
            var appWidth = $('#appContent .content .card').width();
            $('#appContent .content .card').css('width', appWidth + "px");
            if (dirtn === "right") {
                $('#appContent .content .card').addClass("hideright");
            } else if (dirtn === "left") {
                $('#appContent .content .card').addClass("hideleft");
            }
			else {

                $('#appContent .content .card').addClass("hideleft");
            }
           
            var that = this;
            $('#appContent .content .card').one("transitionend webkitTransitionEnd", function (event) {
                event.stopPropagation();
                $('.card').css('visibility', 'visible');
                //console.log("stopped transitionend");
                $('#appContent .content .card').addClass('noTransition');
                if($('#appContent .content .card').hasClass("hideleft")){
                    $('#appContent .content .card').removeClass("hideleft");
                    $('#appContent .content .card').addClass("hideright");
                } else if ($('#appContent .content .card').hasClass("hideright")) {
                    $('#appContent .content .card').removeClass("hideright");
                    $('#appContent .content .card').addClass("hideleft");
                };
                var source = $("#qtn-template").html();
                var myTemplate = Handlebars.compile(source);
                qtnTarget.innerHTML = myTemplate(that.qtns[qtnNumber - 1]);
                var height = $('#appContent .content .card')[0].offsetHeight;//force redraw
                $('#appContent .content .card').removeClass('noTransition');
                $('#appContent .content .card').removeClass("hideright hideleft");
            });
            };
          
        Quiz.prototype.calcScore = function () {
            var total = 0;
            for (var i = 0; i < 10; i++) {
                if (this.qtns[i].userChoice === this.qtns[i].correctAnswer) {
                    total++;
                }
            }//for
            return total;
        };
        Quiz.prototype.writeResult = function (quiz, qtnTarget) {
            
			var source = $("#results-template").html();
            var myTemplate = Handlebars.compile(source);
			 // get first 10 questions - problem
    		//quiz.qtns=quiz.qtns.slice(0,10);
            qtnTarget.innerHTML = myTemplate(quiz);
        };
        Quiz.prototype.writeScore = function (qtnTarget) {
            var score = this.calcScore();
            var source = $("#score-template").html();
            var myTemplate = Handlebars.compile(source);
            qtnTarget.innerHTML = myTemplate(score);
        };
        Quiz.prototype.resetUserChoice = function () {
            for (var i = 0; i < 10; i++) {
                this.qtns[i].userChoice = 0;
            }//for
        }//ftn
    }//ftn
    
    
    // get first 10 questions
    // data.myQtns = data.myQtns.slice(0, 10);

    // initialise variables
    var timerId;
    var quiz1 = new Quiz("web", data.myQtns, 0);
    $("#countTime").html("Time remaining: 5:00");
    var message = document.querySelector('.quizMessage');
    message.innerHTML = '';
    //initialise user choices
    quiz1.resetUserChoice();
    // initialise question
    quiz1.qtnNumber = 0;
    document.querySelector('.quiz').style.display = "block";
    startQuiz(quiz1, quiz1Form);
});//ajaxCall