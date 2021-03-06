
// TODO we may want to remove this global variable as some point; not sure if it is still used in ref app somewhere
var Navigator = {isReady: false}


// TODO figure out out to set up mocking to test this
function KeyboardController(formElement) {

    var initFormModels = function(formEl) {
        var formElement = formEl;
        if (!formElement) {
            formElement = $('div#content > form').first();
        }
        formElement.prepend('<ul id="formBreadcrumb" class="options"></ul>');
        var breadcrumb = formElement.find('#formBreadcrumb').first();

        var sections = _.map(formElement.find('section'), function(s) {
            return new SectionModel(s, breadcrumb);
        });

        var confirmationSection = new ConfirmationSectionModel($('#confirmation'), breadcrumb, _.clone(sections));
        sections.push(confirmationSection);

        var questions = _.flatten( _.map(sections, function(s) { return s.questions; }), true);
        var fields = _.flatten(_.map(questions, function(q) { return q.fields; }), true);
        return [sections, questions, fields];

    }

    var initKeyboardHandlersChain = function(questions, fields) {
        var questionsHandler = QuestionsKeyboardHandler(questions);
        var fieldsHandler = FieldsKeyboardHandler(fields, questionsHandler);
        return fieldsHandler;
    }

    var initMouseHandlers = function(sections, questions, fields) {
        sectionsMouseHandlerInitializer(sections);
        questionsMouseHandlerInitializer(questions);
        fieldsMouseHandlerInitializer(fields);
    }

    var modelsList = initFormModels(formElement);
    var sections=modelsList[0], questions=modelsList[1], fields=modelsList[2];
    initMouseHandlers(sections, questions, fields);
    var handlerChainRoot = initKeyboardHandlersChain(questions, fields);

    handlerChainRoot.handleTabKey();

    $('body').keydown(function(key) {
        switch(key.keyCode ? key.keyCode : key.which) {
            case 38:
                handlerChainRoot.handleUpKey() && key.preventDefault();
                break;
            case 40:
                handlerChainRoot.handleDownKey() && key.preventDefault();
                break;
            case 27:
                handlerChainRoot.handleEscKey() && key.preventDefault();
                break;
            case 9:
                if(event.shiftKey) {
                    handlerChainRoot.handleShiftTabKey();
                } else {
                    handlerChainRoot.handleTabKey();
                }
                key.preventDefault();
                break;
            case 13:
                handlerChainRoot.handleEnterKey();
                key.preventDefault();
            default:
                break;
        }
    });

    // TODO we may want to remove this global variable as some point; not sure if it is still used in ref app somewhere
    Navigator.isReady = true;

    var api = {};

    api.getFieldById = function(id) {
        return _.find(fields, function(element) {
            return element.id == id;
        })
    }

    api.getQuestionById = function(id) {
        return _.find(questions, function(element) {
            return element.id == id;
        })
    }

    return api;
}