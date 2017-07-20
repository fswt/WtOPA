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
    // UndirectedEdgeSets like '{{a,b},{c,d}}'
    $('[data-explain="UndirectedEdgeSet"]').each(function(i) {
        setPopover("Beispieleingaben <br><small>Achtung: Die äußeren Mengenklammern sind gegeben.</small>", "<code>{u,w}</code> oder <code>{u,v},{v,w}</code>", $(this));
    });

    // UndirectedEdge like '{a,b}'
    $('[data-explain="UndirectedEdge"]').each(function(i) {
        setPopover("Beispieleingaben <br><small>Achtung: Die Mengenklammern sind gegeben.</small>", "<code>u,w</code> oder <code>v,w</code>", $(this));
    });

    // VerticeSet like '{}' or '{a,b,c}'
    $('[data-explain="VerticeSet"]').each(function(i) {
        setPopover("Beispieleingaben <br><small>Achtung: Die Mengenklammern sind gegeben.</small>", "<code>u</code> oder <code>u,v,w</code>", $(this));
    });
    
    
    // TopologicalSort like '()' or '(a,b,c)'
    $('[data-explain="TopologicalSort"]').each(function(i) {
        setPopover("Beispieleingaben <br><small>Achtung: Die Tupelklammern sind gegeben.</small>", "<code>u</code> oder <code>u,v,w</code>", $(this));
    });
    
    




}
initializeExplainPopovers();


/* Syntax-Tester / Parser */
function stringWithoutWhitespace(input) {
    return input.replace(/ /g,'');
}

// Checks/Converts strings of format: '', '{a,b}' and '{a,b},{c,d},...'
function undirectedEdgesFromSet(input) {
    var unspacedInput = stringWithoutWhitespace(input);
    var edgeStrings = unspacedInput.split("},{");
    var edges = [];

    // Remove remainig braces and seperate into nodes
    for (var i = 0; i < edgeStrings.length; i++) {
        var edgeString = edgeStrings[i].replace("{","");
        edgeString = edgeString.replace("}", "");
        vertices = edgeString.split(",");

        // Check if parsing went fine (exactly 2 nodes & only a-zA-Z0-9_ characters)
        if (vertices.length != 2) { return false; }
        if (!/^\w+$/.test(vertices[0]+vertices[1])) { return false; }

        edges.push([vertices[0], vertices[1]]);
    }

    return edges;
}

function directedEdgesFromSet(input) { }

// Checks/Converts strings of format: '', 'a,b' and 'a,b,c,...'
function verticesFromSet(input) {
    var unspacedInput = input.replace(/ /g,'')
    var verticeStrings = unspacedInput.split(",");
    var vertices = [];

    for (var i = 0; i < verticeStrings.length; i++) {
        if (!/^\w+$/.test(verticeStrings[i])) { return false; }
        vertices.push(verticeStrings[i]);
    }

    return vertices;
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
    var frage_1_1Button = document.getElementById("frage_1_1").querySelector("button"); 
    var frage_2_1Button = document.getElementById("frage_2_1").querySelector("button"); 
    var frage_3_1Button = document.getElementById("frage_3_1").querySelector("button"); 
    var frage_4_1Button = document.getElementById("frage_4_1").querySelector("button"); 
    var frage_5_1Button = document.getElementById("frage_5_1").querySelector("button"); 

    // Call according evaluation-function
    if (frage_1_1Button == event.target) {
        console.log("Check frage_1_1...");
        checkFrage_1_1()

    } else if (frage_2_1Button == event.target) {
        console.log("Check frage_2_1...");
        checkFrage_2_1();

    } else if (frage_3_1Button == event.target) {
        console.log("Check frage_3_1...");
        checkFrage_3_1();

    } else if (frage_4_1Button == event.target) {
        console.log("Check frage_4_1...");
        checkFrage_4_1();

    } else if (frage_5_1Button == event.target) {
        console.log("Check frage_5_1...");
        checkFrage_5_1();

    } else { console.log("Unknown Submit-Button pressed"); }
}

function checkFrage_1_1() {
    var numberOfQuestions = 7;
    var numberOfCorrectQuestions = 0;

    // Useful variables
    var allEdgesOfN = [['a','b'],['a','e'],['e','d'],['b','c'],['e','b'],['d','c'], ['e','c'], ['b','d']]; 

    // Q1: Bezeichne die gesamte Kantenmenge E für den Nikolaus-Graphen N aus der Abbildung.
    var input_1 = document.getElementById("input_1-frage_1_1");
    var parsed_undirectedEdges = undirectedEdgesFromSet(input_1.value);
    console.log(parsed_undirectedEdges)

    if (parsed_undirectedEdges) {
        if (undirectedEdgeSetsAreEqual(parsed_undirectedEdges, allEdgesOfN)) {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_1);
            numberOfCorrectQuestions += 1;

        } else { inputHasWrongAnswer(input_1); }
    } else { inputHasWrongFormat(input_1); }


    // Q2: Finde einen Knoten mit maximalem Knotengrad in N. 
    var input_2 = document.getElementById("input_2-frage_1_1");
    var vertice = stringWithoutWhitespace(input_2.value);

    if (vertice == "b" || vertice == "e") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_2);
        numberOfCorrectQuestions += 1;

    } else if (input_2.value == "") { 
        inputHasWrongFormat(input_2);
    } else { inputHasWrongAnswer(input_2); }


    // Q3: Nach dem Entfernen welcher Kante in N ist der maximale Knotengrad gleich 3?
    var input_3 = document.getElementById("input_3-frage_1_1");
    var parsed_vertices = verticesFromSet(input_3.value);

    if (parsed_vertices) {
        if (flatArraysAreEqual(parsed_vertices, ['e','b'])) {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_3);
            numberOfCorrectQuestions += 1;

        } else { inputHasWrongAnswer(input_3); }
    } else { inputHasWrongFormat(input_3); }


    // Q4: Nenne zwei Kanten aus N, nach dessen Entfernen ein Knoten isoliert ist.
    var input_4 = document.getElementById("input_4-frage_1_1");
    var parsed_undirectedEdges = undirectedEdgesFromSet(input_4.value);
    console.log(parsed_undirectedEdges)

    if (parsed_undirectedEdges) {
        var solution = [['e','a'],['b','a']];
        if (undirectedEdgeSetsAreEqual(parsed_undirectedEdges, solution)) {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_4);
            numberOfCorrectQuestions += 1;

        } else { inputHasWrongAnswer(input_4); }
    } else { inputHasWrongFormat(input_4); }


    // Q5: Nenne drei Knoten aus N, nach deren Entfernen genau zwei isolierte Knoten in N übrig bleiben.
    var input_5 = document.getElementById("input_5-frage_1_1");
    var parsed_vertices = verticesFromSet(input_5.value);

    if (parsed_vertices) {
        var solutions = [['b','d','e'],['e','b','c']];
        if (flatArraysAreEqual(solutions[0], parsed_vertices) || flatArraysAreEqual(solutions[1], parsed_vertices)) {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_5);
            numberOfCorrectQuestions += 1;

        } else { inputHasWrongAnswer(input_5); }
    } else { inputHasWrongFormat(input_5); }


    // Q6: Wie viele Kanten besitzt N[{a,c}]?
    var input_6 = document.getElementById("input_6-frage_1_1");
    var amount = stringWithoutWhitespace(input_6.value);

    if (amount == "0") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_6);
        numberOfCorrectQuestions += 1;

    } else if (input_6.value == "") { 
        inputHasWrongFormat(input_6);
    } else { inputHasWrongAnswer(input_6); }


    // Q7: Wie viele Kanten besitzt N[∅]+{a,b,c,d,e}?
    var input_7 = document.getElementById("input_7-frage_1_1");
    var amount = stringWithoutWhitespace(input_7.value);

    if (amount == "0") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_7);
        numberOfCorrectQuestions += 1;

    } else if (input_7.value == "") { 
        inputHasWrongFormat(input_7);
    } else { inputHasWrongAnswer(input_7); }



    /**************************/
    // Evaluate all Questions //
    var allCorrect = (numberOfCorrectQuestions == numberOfQuestions);
    var questionPanel = $("#frage_1_1");

    evaluateAllQuestions(questionPanel, allCorrect);
}




function checkFrage_2_1() {
    // Variables
    var numberOfQuestions = 10;
    var numberOfCorrectQuestions = 0;


    // Q1: Sei K ein Graph mit den Knoten {x,y,z}. Spezifiziere die Kantenmenge E(K) so, dass K einen Kreis enthält
    var input_1 = document.getElementById("input_1-frage_2_1");
    var parsed_undirectedEdges = undirectedEdgesFromSet(input_1.value);

    if (parsed_undirectedEdges) {
        if (undirectedEdgeSetsAreEqual(parsed_undirectedEdges, [['x','y'],['y','z'],['z','x']])) {
            // Answer is correct, increment counter
            inputHasCorrectAnswer(input_1);
            numberOfCorrectQuestions += 1;

        } else { inputHasWrongAnswer(input_1); }
    } else { inputHasWrongFormat(input_1); }


    // Q2: Sei A={e} und B={d,c}. Wie viele kantendisjunkte A-B-Wege existieren im Nikolaus-Graph N?
    var input_2 = document.getElementById("input_2-frage_2_1");
    var amount = stringWithoutWhitespace(input_2.value);

    if (amount === "4") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_2);
        numberOfCorrectQuestions += 1;

    } else if (input_2.value == "") { 
        inputHasWrongFormat(input_2);
    } else { inputHasWrongAnswer(input_2); }


    // Q3: Was ist der zentrale Knoten in N?
    var input_3 = document.getElementById("input_3-frage_2_1");
    var vertice = stringWithoutWhitespace(input_3.value);

    if (vertice == "b" || vertice == "e") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_3);
        numberOfCorrectQuestions += 1;

    } else if (input_3.value == "") { 
        inputHasWrongFormat(input_3);
    } else { inputHasWrongAnswer(input_3); }


    // Q4: Was ist diam(N)?
    var input_4 = document.getElementById("input_4-frage_2_1");
    var amount = stringWithoutWhitespace(input_4.value);

    if (amount === "2") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_4);
        numberOfCorrectQuestions += 1;

    } else if (amount == "") { 
        inputHasWrongFormat(input_4);
    } else { inputHasWrongAnswer(input_4); }



    // Q5: Welcher spezielle Pfad ist beim Haus des Nikolaus-Problem gesucht?
    /* DEFEKT
    var input_5 = document.getElementById("input_5-frage_2_1");
    var amount = stringWithoutWhitespace(input_5.value);

    if (amount === "9") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_5);
        numberOfCorrectQuestions += 1;

    } else if (amount == "") { 
        inputHasWrongFormat(input_5);
    } else { inputHasWrongAnswer(input_5); }
    */



    // Q6: Welcher spezielle Pfad ist beim Haus des Nikolaus-Problem gesucht?
    var input_6 = $(document.getElementById("input_6-frage_2_1"));
    var isCorrect = strStartsWith(input_6.html(), "Eulerweg");
    var isEmpty = strStartsWith(input_6.html(), "Spezialformen");

    if (isCorrect) {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_6);
        numberOfCorrectQuestions += 1;

    } else if (isEmpty) { 
        inputHasWrongFormat(input_6);
    } else { inputHasWrongAnswer(input_6); }


    // Q7: Besitzt der Graph I (Abbildung) einen Eulerweg?
    if (checkDropdownQuestion($("#input_7-frage_2_1"), "Ja", "Antwort")) {
        numberOfCorrectQuestions += 1; 
    }

    // Q8: Besitzt I einen Eulerkreis?
    if (checkDropdownQuestion($("#input_8-frage_2_1"), "Nein", "Antwort")) {
        numberOfCorrectQuestions += 1; 
    }

    // Q9: Besitzt I einen Hamiltonweg?
    if (checkDropdownQuestion($("#input_9-frage_2_1"), "Ja", "Antwort")) {
        numberOfCorrectQuestions += 1; 
    }

    // Q10: Besitzt I einen Hamiltonkreis?
    if (checkDropdownQuestion($("#input_10-frage_2_1"), "Ja", "Antwort")) {
        numberOfCorrectQuestions += 1; 
    }


    /**************************/
    // Evaluate all Questions //
    var allCorrect = (numberOfCorrectQuestions == numberOfQuestions);
    var questionPanel = $("#frage_2_1");

    evaluateAllQuestions(questionPanel, allCorrect);
}




function checkFrage_3_1() {
    // Variables
    var numberOfQuestions = 3;
    var numberOfCorrectQuestions = 0;


    // Q1: Sei G=(V,E) ein Graph. Das gesuchte Wort bezeichnet einen zusammenhängenden, induzierten Teilgraph G′=(V′,E′) mit V′⊆V und E′={{v1,v2}∈E : v1,v2∈V′}.
    var input_1 = document.getElementById("input_1-frage_3_1");
    var word = stringWithoutWhitespace(input_1.value);

    if (word === "Komponente" || word === "komponente") {
        // Answer is correct, increment counter
        inputHasCorrectAnswer(input_1);
        numberOfCorrectQuestions += 1;

    } else if (input_1.value == "") { 
        inputHasWrongFormat(input_1);
    } else { inputHasWrongAnswer(input_1); }


    // Q2: Ist ein nichtleerer Graph G genau dann unzusammenhängend, wenn κ(G)=0 ist?
    if (checkDropdownQuestion($('#input_2-frage_3_1'), "Ja", "Antwort")) {
        numberOfCorrectQuestions += 1;
    }

    // Q2: Ist ein nichtleerer Graph G genau dann unzusammenhängend, wenn λ(G)=0 ist?
    if (checkDropdownQuestion($('#input_3-frage_3_1'), "Ja", "Antwort")) {
        numberOfCorrectQuestions += 1;
    }


    /**************************/
    // Evaluate all Questions //
    var allCorrect = (numberOfCorrectQuestions == numberOfQuestions);
    var questionPanel = $("#frage_3_1");

    evaluateAllQuestions(questionPanel, allCorrect);
}




function checkFrage_4_1() {
    // Variables
    var numberOfQuestions = 9;
    var numberOfCorrectQuestions = 0;


    // Q1: Was zeigt die interaktive Grafik aus Abschnitt 1 für T−e?
    if (checkDropdownQuestion($("#input_1-frage_4_1"), "Wald", "Spezialform")) {
        numberOfCorrectQuestions += 1;
    }

    // Q2: Was zeigt die Grafik für T[c]?
    if (checkDropdownQuestion($("#input_2-frage_4_1"), "Baum", "Spezialform")) {
        numberOfCorrectQuestions += 1;
    }

    // Q3: Was zeigt die Grafik für T[{a,e,f}]?
    if (checkDropdownQuestion($("#input_3-frage_4_1"), "Weder", "Spezialform")) {
        numberOfCorrectQuestions += 1;
    }

    // Q4: Wie viele Blätter hat der Baum B aus der Abbildung?
    var input_4 = document.getElementById("input_4-frage_4_1");
    var amount = stringWithoutWhitespace(input_4.value);

    if (amount === "5") {
        inputHasCorrectAnswer(input_4);
        numberOfCorrectQuestions += 1;

    } else if (amount == "") { 
        inputHasWrongFormat(input_4);
    } else { inputHasWrongAnswer(input_4); }


    // Q5: Wie viele Kanten besitzen alle Kreise eines bipartiten Graphen?
    if (checkDropdownQuestion($("#input_5-frage_4_1"), "gerade", "Anzahl")) {
        numberOfCorrectQuestions += 1;
    }

    // Q6: Existiert ein Eulerweg im Niklaus-Graphen N (1. Abschnitt), so dass dessen Kanten einen Spannbaum von N bilden?
    if (checkDropdownQuestion($("#input_6-frage_4_1"), "Nein", "Antwort")) {
        numberOfCorrectQuestions += 1;
    }

    // Q7: Besitzt N einen Hamiltonweg, so dass dessen Kanten einen Spannbaum bilden?
    if (checkDropdownQuestion($("#input_7-frage_4_1"), "Ja", "Antwort")) {
        numberOfCorrectQuestions += 1;
    }

    // Q8: Was ist κ(B)?
    if (checkStringEqualityQuestions($("#input_8-frage_4_1"), ["1"])) {
        numberOfCorrectQuestions += 1;
    }

    // Q9: Was ist λ(B)?
    if (checkStringEqualityQuestions($("#input_9-frage_4_1"), ["1"])) {
        numberOfCorrectQuestions += 1;
    }



    /**************************/
    // Evaluate all Questions //
    var allCorrect = (numberOfCorrectQuestions == numberOfQuestions);
    var questionPanel = $("#frage_4_1");

    evaluateAllQuestions(questionPanel, allCorrect);
}




function checkFrage_5_1() {
    // Variables
    var numberOfQuestions = 6;
    var numberOfCorrectQuestions = 0;


    // Q1: Wie viele Kanten besitzt ein gerichteter, vollständiger Graph mit 6 Knoten?
    if (checkStringEqualityQuestions($("#input_1-frage_5_1"), ["30"])) {
        numberOfCorrectQuestions += 1;
    }

    // Q2: Nenne eine Quelle von D.
    if (checkStringEqualityQuestions($("#input_2-frage_5_1"), ['a', 'c'])) {
        numberOfCorrectQuestions += 1;
    }

    // Q3: Nenne eine Senke von D.
    if (checkStringEqualityQuestions($("#input_3-frage_5_1"), ['d'])) {
        numberOfCorrectQuestions += 1;
    }

    // Q4: Nenne eine gültige topologische Sortierung des Graphen D. 
    var input_4 = $('#input_4-frage_5_1');
    var vertices = verticesFromSet(input_4.val());
    var isCorrect = (flatArraysAreEqualWithOrder(vertices, ['a','c','b','d']) || flatArraysAreEqualWithOrder(vertices, ['c','a','b','d']));
    
    if (isCorrect) {
        inputHasCorrectAnswer(input_4);
        numberOfCorrectQuestions += 1;
        
    } else if (input_4.val() == "")  { 
        inputHasWrongFormat(input_4);
    } else { inputHasWrongAnswer(input_4); }


    // Q5: Wie viele gültige topologische Sortierungen besitzt D+e+(e,a)?
    if (checkStringEqualityQuestions($("#input_5-frage_5_1"), ['3'])) {
        numberOfCorrectQuestions += 1;
    }

    // Q6: Was ist die Summe aller Kantengewichte des minimalen Spannbaums von W?
    if (checkStringEqualityQuestions($("#input_6-frage_5_1"), ['287'])) {
        numberOfCorrectQuestions += 1;
    }


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








