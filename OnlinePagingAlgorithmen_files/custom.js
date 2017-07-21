/* Activate all bootstrap-tooltips at once */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})


/* Activates smooth-scrolling for all anchor-links, Source: http://css-tricks.com/snippets/jquery/smooth-scrolling/ */
$(function() {
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 20
                }, 1000);
                return false;
            }
        }
    });
});


/* Removes the :active-state from the modal button when the #infoModal closes */
$(function() {
    var infoModal = document.getElementById("infoModal");
    $(infoModal).on('hidden.bs.modal', function (e) {
        // Select Modal-Button and prevent it from getting focused (looks ugly)
        var modalButton = document.querySelectorAll(".page-header > nav > ul > li")[0];
        modalButton = modalButton.children[0];
        modalButton.onfocus = function() {
            this.blur();
            modalButton.onfocus = null;
        }
    })
});


/**********************************************************************/
/* Following functions handle the testing of Kontrollfragen-Solutions */

/* Update Fortschrittsanzeige, progressBar */
function updateFortschrittProgressBar() {
    // Detrmine amount of panels
    var questionPanels = $('.kontrollfragen .panel');
    var correctQuestionPanels = $('.kontrollfragen .panel-success');

    var valuemax = questionPanels.length;
    var valuenow = correctQuestionPanels.length;
    var percentage = valuenow / valuemax * 100;

    // Find according progressBar and update
    var progressBar = $('#fortschrittProgressBar');
    progressBar.attr("style", "width: "+percentage+"%;");
    progressBar.attr("aria-valuenow", valuenow);
    progressBar.attr("aria-valuemax", valuemax);
    progressBar.html(Math.round(percentage)+"%");

    // Fire Notification
    var notificationType = Math.floor( Math.random() * 5 ); // [0,4]
    percentage = Math.round(percentage);
    if (notificationType == 0) {
        $.notify("Klasse, schon "+percentage+"% gelöst, weiter so ;)", "success");
    } else if (notificationType == 1) {
        $.notify("Du bist jetzt mit "+percentage+"% fertig. Schaffst du die 100?", "success");
    } else if (notificationType == 2 || notificationType == 3 || notificationType == 4) {
        $.notify("Fortschritt: "+percentage+"%", "success");
    }
}




/* Text-Input Explain-Popover */
function setPopover(withTitle, andContent, onInputField) {
    onInputField.data("placement", "top");
    onInputField.data("content", andContent);
    onInputField.data("trigger", "focus");
    onInputField.data("html", "true");
    onInputField.data("title", withTitle);
    onInputField.popover();
};

function initializeExplainPopovers() {
    // requestingChain like 'A,B,C,D'
    $('[data-explain="requestingChain"]').each(function(i) {
        setPopover("Beispieleingabe <br><small>Bitte die Eingabe wie folgt formatieren.</small>", "<code>A,B,C,D</code>", $(this));
    });

}
initializeExplainPopovers();


/* Syntax-Tester / Parser */
function stringWithoutWhitespace(input) {
    return input.replace(/ /g,'');
}

/* Equality-Tester */

// This function compares all elements WITH order of two flat arrays. (e.q. [1,2] != [2,1] or [1] = [1]).
function flatArraysAreEqualWithOrder(a,b) {
    if (a.length != b.length) { return false; }

    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) { return false; }
    }

    return true;
}



// This function compares all elements without order of two flat arrays. (e.q. [1,2] = [2,1] or [1] = [1]).
function flatArraysAreEqual(a,b) {
    if (a.length != b.length) { return false; }

    // Sort arrays
    //    sortValue = function(el) { return el; }
    //    a = _.sortBy(a, sortValue);
    //    b = _.sortBy(b, sortValue);
    a.sort();
    b.sort();

    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) { return false; }
    }

    return true;
}

// This function compares two undirected edge-sets (like [[3,4],[9,0]] and [[1,0]]) and returns true if they have the same elements. The undirected edge [a,b] is equal to [b,a].
function undirectedEdgeSetsAreEqual(a,b) {
    if (a.length != b.length) { return false; }

    for (var i = 0; i < a.length; i++) {
        var elementIsThere = false;

        for (var k = 0; k < b.length; k++) {
            if (flatArraysAreEqual(a[i], b[k])) { elementIsThere = true; }   
        }

        if (!elementIsThere) { return false; }
    }

    return true;
}


/* Input/Text-Fields State Modifier */
function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function getForm_GroupAndRemoveHighlightClasses(input) {
    var form_group = $(input).parent().parent();

    if (form_group.hasClass("form-group")) {
        form_group.removeClass("has-error");
        form_group.removeClass("has-success");
        form_group.removeClass("has-warning");

        return form_group;
    }

    console.log("Can't determine .form-group of input "+input);
    return false;
}

function inputHasWrongAnswer(input) {
    var form_group = getForm_GroupAndRemoveHighlightClasses(input)
    if (form_group) {
        form_group.addClass("has-error");
    }
}

function inputHasWrongFormat(input) {
    var form_group = getForm_GroupAndRemoveHighlightClasses(input)
    if (form_group) {
        form_group.addClass("has-warning");
    }
}

function inputHasCorrectAnswer(input) {
    var form_group = getForm_GroupAndRemoveHighlightClasses(input)
    if (form_group) {
        form_group.addClass("has-success");
    }
}


function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

function checkDropdownQuestion(input, answer, placeholder) {
    var isCorrect = strStartsWith($(input).html(), answer);
    var isEmpty = strStartsWith($(input).html(), placeholder);

    if (isCorrect) {
        inputHasCorrectAnswer(input);
        return true;

    } else if (isEmpty) { 
        inputHasWrongFormat(input);
    } else { inputHasWrongAnswer(input); }

    return false;
}

function checkStringEqualityQuestions(input, stringArray) {
    var isCorrect = false;
    var inputString = stringWithoutWhitespace($(input).val());

    for (i = 0; i < stringArray.length; i++) {
        if (inputString === stringArray[i]) { 
            isCorrect = true;
        }
    }

    if (isCorrect) {
        inputHasCorrectAnswer(input);
        return true;

    } else if (inputString == "") { 
        inputHasWrongFormat(input);
    } else { inputHasWrongAnswer(input); }
}


function evaluateAllQuestions(questionPanel, allCorrect) {
    $(questionPanel).removeClass("panel-warning").removeClass("panel-success");

    if (allCorrect) {
        // Set .panel-success and update FortschrittsProgress
        questionPanel.addClass("panel-success");
        updateFortschrittProgressBar();

    } else { questionPanel.addClass("panel-warning"); }
}


/* Solution-Tester */

function checkKontrollfrage(event) {
    // All Frage-Buttons
    var frage_3_1Button = document.getElementById("frage_3_1").querySelector("button"); 
    var frage_5_1Button = document.getElementById("frage_5_1").querySelector("button"); 

    // Call according evaluation-function
    if (frage_3_1Button == event.target) {
        console.log("Check frage_3_1...");
        checkFrage_3_1()

    } else if (frage_5_1Button == event.target) {
        console.log("Check frage_5_1...");
        checkFrage_5_1();

    } else { console.log("Unknown Submit-Button pressed"); }
}

function checkFrage_3_1() {
    var numberOfQuestions = 1;
    var numberOfCorrectQuestions = 0;

    // Q1: Überlege Dir eine Eingabe-Sequenz der Länge vier, für die der LRU, der sich im letzten Zustand aus dem obigen Beispiel befindet, nur Misses erzeugt. Dabei darfst Du nur Elemente aus dem Bereich B-F wählen. 
    var input_1 = document.getElementById("input_1-frage_3_1");

    if (input_1.value == "B,C,E,D") {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_1);
            numberOfCorrectQuestions += 1;

    } else { inputHasWrongAnswer(input_1);}


    /**************************/
    // Evaluate all Questions //
    var allCorrect = (numberOfCorrectQuestions == numberOfQuestions);
    var questionPanel = $("#frage_3_1");

    evaluateAllQuestions(questionPanel, allCorrect);
}

function checkFrage_5_1() {
    var numberOfQuestions = 2;
    var numberOfCorrectQuestions = 0;

    // Q1: Finde die Belegung für b und C, sodass der Online-Algorithmus A exakt genauso gut performt wie der Offline-Algorithmus. 
    var input_1 = document.getElementById("input_1-frage_5_1");
    var input_2 = document.getElementById("input_2-frage_5_1");
    // b
    if (input_1.value == "0") {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_1);
            numberOfCorrectQuestions += 1;

    } else { inputHasWrongAnswer(input_1);}
    
    // C
    if (input_2.value == "1") {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_2);
            numberOfCorrectQuestions += 1;

    } else { inputHasWrongAnswer(input_2);}


    /**************************/
    // Evaluate all Questions //
    var allCorrect = (numberOfCorrectQuestions == numberOfQuestions);
    var questionPanel = $("#frage_5_1");

    evaluateAllQuestions(questionPanel, allCorrect);
}

/* Kontrollfragen-Initializer */

// Set button class for solve-buttons
// Wire all these buttons to their specific tester
// Count buttons/functions



/*************************/
/*    Proof-Questions    */


/* This function returns a string like "04:33" with 273 seconds as input */
function timeStringFromSeconds(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = timeInSeconds - minutes * 60;
    var timeString = (seconds < 10) ? (minutes+":0"+seconds) : (minutes+":"+seconds);
    return timeString;
}

/* This ENUM represents the possible button-types */
var ProofButtonTypes = { Hint : 0,  Solution : 1}

/* This function creates a Hint ot Solution Button with onclick-functions */
function createProofButton(ofType) {
    // Determine Button-specific properties
    var buttonHTML = "";
    var sectionClass = "";

    if (ofType == ProofButtonTypes.Hint) {
        buttonHTML = '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Hinweis'
        sectionClass = ".hint"

    } else if (ofType == ProofButtonTypes.Solution) {
        buttonHTML = '<span class="glyphicon glyphicon-file" aria-hidden="true"></span> Beispiellösung'
        sectionClass = ".solution"

    } else { console.log("Unknown Button-Type: "+ofType); }

    var button = document.createElement('button');
    button.className = "btn btn-warning";
    $(button).html(buttonHTML);

    button.addEventListener("click", function() {
        // Show according section on-click
        var $proofQuestion = $(this).parent().parent();
        var section = $proofQuestion.find(sectionClass).first();
        $(section).fadeIn();
        $(this).fadeOut();

        // Colour questionPanel green (panel-success) if "Musterlösung" was clicked
        if (ofType == ProofButtonTypes.Solution) {
            var questionPanel = $proofQuestion.parent().parent();
            questionPanel.removeClass(" panel-warning").addClass(" panel-success");

            // Update FortschrittsProgress after .panel-success
            updateFortschrittProgressBar();
        }
    });

    return button;
}

/* This function starts the interval-timer and shows hint-/solution-buttons at the given amount of seconds */
function startTimerForButton(button, hintTime, finishTime) {
    console.log("Timer started with hintTime="+hintTime+", finishTime="+finishTime);

    $(button).button('loading');
    var $actionsSection = $(button).parent();
    var timeLeft = finishTime - 1;

    var timer = setInterval( function() {

        var timeString = timeStringFromSeconds(timeLeft);
        var clockIcon = '<span class="glyphicon glyphicon-time small" aria-hidden="true"></span> '
        $(button).html(clockIcon + timeString);

        timeLeft -= 1;

        // Check for Hint- and Finish-Events
        if (timeLeft == finishTime - hintTime - 1) {
            // Create Hint-Button and append
            var hintButton = createProofButton(ProofButtonTypes.Hint);
            $actionsSection.append(hintButton);

        } else if (timeLeft === -1) {
            // Create Solution-Button and append
            var proofButton = createProofButton(ProofButtonTypes.Solution);
            $actionsSection.append(proofButton);

            // Abort Timer and hide start-button
            clearInterval(timer);
            $(button).fadeOut();
        }

    }, 1000);

}

/* This function creates a explaination-popover for the according proof-question and appends it to the according page-heading */
function initializeProofQuestionPopover($proofQuestion, hintTime, finishTime) {
    // Determine according panel-heading
    var panel = $proofQuestion.parent().parent();
    var panelHeading = panel.find(".panel-heading").first();
    var finishTimeString = timeStringFromSeconds(finishTime);
    var hintTimeString = timeStringFromSeconds(hintTime);

    // Create Info-Sign
    var explainProofQuestion = $('<div class="explain-proof-question"><small>'+finishTimeString+' Minuten</small> <span class="glyphicon glyphicon-question-sign small" aria-hidden="true"></span></div>');

    // Add Popover-Capabilities to it
    var popoverTitle = '<small>Da Beweise schlecht maschinell verifiziert werden können, findet diese Aufgabe timer-basiert statt.</small>';
    var popoverContent = 'Drücke auf Start um die Aufgabe zu beginnen:<ul><li>Nach <strong>'+ hintTimeString +' min</strong> kannst du dir einen Hinweis anzeigen lassen.</li><li>Nach <strong>'+ finishTimeString +' min</strong> steht dir eine Beispiellösung zur Verfügung.</li></ul>';
    explainProofQuestion.data("trigger", "hover");
    explainProofQuestion.data("placement", "left");
    explainProofQuestion.data("html", "true");
    explainProofQuestion.data("content", popoverContent);
    explainProofQuestion.data("title", popoverTitle);
    explainProofQuestion.popover();

    // Append Element to pageHeading
    panelHeading.append(explainProofQuestion);
}

/* This function creates an .actions-div in all .proof-question(s) and appends a newly created start-button with onclick-handler which calls 'startTimerForButton()'. */
$(function initializeProofQuestions() {
    // Determine all Elements with class .proof-question
    var proofQuestions = document.querySelectorAll(".proof-question")

    for (var i = 0; i < proofQuestions.length; i++) {
        // Determine start-button and intervall-times
        var proofQuestion = proofQuestions[i];
        var hintTime = $(proofQuestion).data("hint-time");
        var finishTime = $(proofQuestion).data("finish-time");

        // Initialize Proof-Question Popover
        initializeProofQuestionPopover($(proofQuestion), hintTime, finishTime);

        // Create Start-Button
        var startButton = document.createElement('button');
        startButton.className = "btn btn-success";
        $(startButton).html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Start');
        var timeString = timeStringFromSeconds(finishTime);
        $(startButton).data("loading-text", '<span class="glyphicon glyphicon-time small" aria-hidden="true"></span> '+timeString);

        // Wire up Event-Handler
        startButton.onclick = function() {
            // Workaround because Closure seems to save wrong 'proofQuestion'-reference
            var $accordingProofQuestion = $(this).parent().parent();
            var hTime = $accordingProofQuestion.data("hint-time");
            var fTime = $accordingProofQuestion.data("finish-time");

            startTimerForButton(this, hTime, fTime);
        };

        // Create actionsSection and append button
        var actionsSection = document.createElement("div");
        actionsSection.className = "actions";
        actionsSection.appendChild(startButton);

        // Insert actionsSection after div.task
        var taskSection = proofQuestion.querySelector("div.task");
        $(actionsSection).insertAfter(taskSection);        
    }
});





/********************************/
/* Thumbnail Picture-Switcher */


function switchImgAtTargetWithPath() {
    var imagePath = $(this).data("path");
    var imgTarget = $(this).data("target");

    $(imgTarget).attr("src", imagePath);
}


$(function initializeGraphOperationRadioButtons() {
    // Determine all input[type=radio] elements under .picture-switcher-classes
    $('.picture-switcher input[type="radio"]').each(function(index, item) {
        if ($(item).attr('data-target') && $(item).attr('data-path')) {
            $(item).bind("change", switchImgAtTargetWithPath);
        }
    });
});








/** Activate Dropdown-Menus **/
$(".dropdown-menu li a").click(function(){
    var selText = $(this).text();
    $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
});


/** Closes Navigation-Dropdown after link-click on it */
function closeNavigationDropdown() {
    $('#navigationDropdownMenu').dropdown('toggle')
}








